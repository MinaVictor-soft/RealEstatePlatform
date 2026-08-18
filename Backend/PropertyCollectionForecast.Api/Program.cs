using Microsoft.EntityFrameworkCore;
using PropertyCollectionForecast.Api.Middleware;
using PropertyCollectionForecast.Application;
using PropertyCollectionForecast.Infrastructure;
using PropertyCollectionForecast.Infrastructure.Persistence;
using PropertyCollectionForecast.Infrastructure.Seeding;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Anchor the SQLite DB to the executing assembly's directory so the path is
// stable regardless of the working directory the process was launched from.
// AppContext.BaseDirectory is always the folder that contains the compiled
// assembly (e.g. bin/Debug/net8.0/ for `dotnet run`, the publish output dir
// for deployed builds) — it never changes with the CWD.
var dbPath = Path.Combine(AppContext.BaseDirectory, "forecast.db");
builder.Configuration["ConnectionStrings:DefaultConnection"] = $"Data Source={dbPath}";

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
