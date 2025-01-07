using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.IO;

public class CustomMiddleware
{
    private readonly RequestDelegate _next;

    public CustomMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        if (context.Response.StatusCode == StatusCodes.Status404NotFound)
        {
            var path = context.Request.Path.Value;
            if (path.StartsWith("/api/"))
            {
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\": \"Resource not found\"}");
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status200OK;
                context.Response.ContentType = "text/html";
                await context.Response.SendFileAsync(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"));
            }
        }
    }
}