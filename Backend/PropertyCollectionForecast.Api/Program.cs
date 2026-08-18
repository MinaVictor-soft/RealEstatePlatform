using Microsoft.EntityFrameworkCore;
using PropertyCollectionForecast.Api.Middleware;
using PropertyCollectionForecast.Application;
using PropertyCollectionForecast.Infrastructure;
using PropertyCollectionForecast.Infrastructure.Persistence;
using PropertyCollectionForecast.Infrastructure.Seeding;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Resolve a relative SQLite path against ContentRootPath so the DB location is
// predictable regardless of the working directory at startup.
const string connKey = "ConnectionStrings:DefaultConnection";
var rawConn = builder.Configuration[connKey] ?? "Data Source=forecast.db";
const string dsPrefix = "Data Source=";
if (rawConn.StartsWith(dsPrefix, StringComparison.OrdinalIgnoreCase))
{
    var dataSource = rawConn[dsPrefix.Length..].TrimEnd(';');
    if (!Path.IsPathRooted(dataSource))
    {
        var absolutePath = Path.Combine(builder.Environment.ContentRootPath, dataSource);
        builder.Configuration[connKey] = $"{dsPrefix}{absolutePath}";
    }
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ForecastDbContext>();
    await db.Database.MigrateAsync();
    var seeder = scope.ServiceProvider.GetRequiredService<IDbSeeder>();
    await seeder.SeedAsync();
}

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();
