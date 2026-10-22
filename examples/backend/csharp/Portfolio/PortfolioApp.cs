using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;

namespace Portfolio;

public static class PortfolioApp
{
    // #region factory
    public static WebApplication Build(IStatusQueries queries, IProjectRepository projects, TokenService tokens,
        Action<WebApplicationBuilder>? configure = null)
    {
        // Everything the app needs comes in as an argument, so a test can pass fakes.
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddSingleton(queries).AddSingleton(projects).AddSingleton(tokens);
        // Body-binding failures (bad JSON, unknown fields) reach our error handler instead of a bare 400.
        builder.Services.Configure<RouteHandlerOptions>(o => o.ThrowOnBadRequest = true);
        configure?.Invoke(builder);
        var app = builder.Build();
        // #endregion

        // #region errors
        app.UseExceptionHandler(errorApp => errorApp.Run(async ctx =>
        {
            var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
            if (ex is BadHttpRequestException { InnerException: JsonException json })
            {
                var field = (json.Path ?? "$").TrimStart('$', '.');
                ctx.Response.StatusCode = 400;
                await ctx.Response.WriteAsJsonAsync(new { error = "Invalid request.", errors = new Dictionary<string, string> { [field] = "Unknown or invalid field." } });
                return;
            }
            // The details go to the log, never to the caller (they can name servers, users, SQL).
            var traceId = ctx.TraceIdentifier;
            ctx.RequestServices.GetRequiredService<ILogger<WebApplication>>().LogError(ex, "Unhandled error {TraceId}", traceId);
            ctx.Response.StatusCode = 500;
            await ctx.Response.WriteAsJsonAsync(new { error = "Something went wrong.", traceId });
        }));
        // #endregion

        // #region routes
        app.MapGet("/status", async (IStatusQueries q) =>
        {
            try
            {
                var s = await q.StatusAsync();
                var m = new { sent = s.Sent ?? 0, interviewing = s.Interviewing ?? 0, followupsDue = s.FollowupsDue ?? 0 };
                return Results.Ok(new { healthy = true, summary = $"{m.sent} sent, {m.interviewing} interviewing, {m.followupsDue} follow-up(s) due", metrics = m });
            }
            catch (Exception)
            {
                // Unhealthy is an answer, not an error: the dashboard shows it.
                return Results.Ok(new { healthy = false, error = "Database unreachable." });
            }
        });

        app.MapGet("/projects/{key}", async (string key, IProjectRepository repo) =>
            await repo.FindAsync(key) is { } row
                ? Results.Ok(row)
                : Results.NotFound(new { error = $"Unknown project: {key}" }));

        app.MapPost("/projects", async (CreateProject body, IProjectRepository repo) =>
        {
            var problems = new List<ValidationResult>();
            if (!Validator.TryValidateObject(body, new ValidationContext(body), problems, validateAllProperties: true))
                return Results.BadRequest(new
                {
                    error = "Invalid request.",
                    errors = problems.ToDictionary(p => JsonNamingPolicy.CamelCase.ConvertName(p.MemberNames.First()), p => p.ErrorMessage),
                });
            if (await repo.FindAsync(body.Key) is not null)
                return Results.Conflict(new { error = $"Project {body.Key} already exists." });
            var row = new ProjectRow(body.Key, body.DisplayName, body.AdapterBaseUrl);
            await repo.AddAsync(row);
            return Results.Created($"/projects/{row.Key}", row);
        }).AddEndpointFilter(RequireRole("Admin"));
        // #endregion

        return app;
    }

    // #region roles
    private static Func<EndpointFilterInvocationContext, EndpointFilterDelegate, ValueTask<object?>> RequireRole(params string[] roles) =>
        async (ctx, next) =>
        {
            var header = ctx.HttpContext.Request.Headers.Authorization.ToString();
            if (!header.StartsWith("Bearer ")) return Results.Json(new { error = "Sign in first." }, statusCode: 401);
            try
            {
                var tokens = ctx.HttpContext.RequestServices.GetRequiredService<TokenService>();
                var role = tokens.VerifyAccess(header["Bearer ".Length..]).FindFirst("role")?.Value;
                if (!roles.Contains(role)) return Results.Json(new { error = "Not allowed for your role." }, statusCode: 403);
            }
            catch (AuthException ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: 401);
            }
            return await next(ctx);
        };
    // #endregion
}
