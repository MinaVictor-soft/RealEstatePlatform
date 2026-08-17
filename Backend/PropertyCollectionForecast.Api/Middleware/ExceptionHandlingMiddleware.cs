namespace PropertyCollectionForecast.Api.Middleware;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using PropertyCollectionForecast.Application.Exceptions;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainValidationException ex)
        {
            var modelState = new ModelStateDictionary();
            foreach (var error in ex.Errors)
            {
                modelState.AddModelError(error.Key, error.Value.First());
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(new ValidationProblemDetails(modelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed"
            });
        }
        catch (KeyNotFoundException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Not found",
                Detail = ex.Message
            });
        }
    }
}
