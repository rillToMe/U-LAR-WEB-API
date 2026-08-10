using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace u_lar_be.Common.Exceptions;

/// <summary>
/// Mengubah setiap unhandled exception menjadi response ProblemDetails
/// (RFC 7807) supaya Controller tidak perlu try/catch sama sekali.
/// Detail exception yang tak dikenal tidak dibocorkan ke client.
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var isKnown = exception is AppException;

        if (isKnown)
        {
            logger.LogInformation(exception, "Request ditolak: {Message}", exception.Message);
        }
        else
        {
            logger.LogError(exception, "Unhandled exception pada {Path}", httpContext.Request.Path);
        }

        var problem = new ProblemDetails
        {
            Status = (exception as AppException)?.StatusCode ?? StatusCodes.Status500InternalServerError,
            Title = isKnown ? exception.Message : "Terjadi kesalahan pada server.",
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = problem.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }
}
