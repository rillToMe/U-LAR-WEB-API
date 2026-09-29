using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace u_lar_be.Common.Exceptions;

/// <summary>
/// Mengubah setiap unhandled exception menjadi response ProblemDetails
/// (RFC 7807, application/problem+json) supaya Controller tidak perlu
/// try/catch sama sekali.
///
/// Kontrak dengan frontend:
/// - <c>code</c>   — kode stabil (not_found, conflict, validation_failed, ...)
///                   yang diterjemahkan frontend ke pesan bahasa user.
/// - <c>detail</c> — pesan teknis untuk log/debug; jangan ditampilkan apa
///                   adanya ke user.
/// - <c>errors</c> — field-level errors (hanya untuk validasi).
/// - <c>traceId</c> — pencarian cepat di log server.
///
/// Exception yang tak dikenal (bug) tidak membocorkan detail ke client.
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var traceId = httpContext.TraceIdentifier;
        var method = httpContext.Request.Method;
        var path = httpContext.Request.Path;

        ProblemDetails problem;

        switch (exception)
        {
            case AppException appEx:
                // Error yang disengaja (4xx) — cukup Warning tanpa stack.
                logger.LogWarning(
                    "Request ditolak: {Method} {Path} → {StatusCode} ({Code}): {Message} [{TraceId}]",
                    method, path, appEx.StatusCode, appEx.Code, appEx.Message, traceId);

                problem = new ProblemDetails
                {
                    Status = appEx.StatusCode,
                    Title = "Permintaan ditolak.",
                    Detail = appEx.Message,
                    Instance = path
                };
                problem.Extensions["code"] = appEx.Code;
                problem.Extensions["traceId"] = traceId;

                if (appEx is ValidationFailedException validation && validation.Errors.Count > 0)
                {
                    problem.Extensions["errors"] = validation.Errors;
                }

                break;

            case ValidationException fvEx:
                // FluentValidation dilempar manual dari service.
                logger.LogWarning(
                    "Validasi gagal: {Method} {Path} [{TraceId}] {Errors}",
                    method, path, traceId, fvEx.Message);

                problem = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Data yang dikirim tidak valid.",
                    Instance = path
                };
                problem.Extensions["code"] = "validation_failed";
                problem.Extensions["traceId"] = traceId;
                problem.Extensions["errors"] = fvEx.Errors
                    .GroupBy(x => string.IsNullOrEmpty(x.PropertyName) ? "_" : x.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(x => x.ErrorMessage).ToArray());

                break;

            default:
                // Bug tak terduga — stack trace ke log, tidak ke client.
                logger.LogError(
                    exception,
                    "Unhandled exception pada {Method} {Path} [{TraceId}]",
                    method, path, traceId);

                problem = new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Title = "Terjadi kesalahan pada server.",
                    Detail = "Silakan coba beberapa saat lagi. Laporkan ke pengelola kalau berlanjut.",
                    Instance = path
                };
                problem.Extensions["code"] = "internal_error";
                problem.Extensions["traceId"] = traceId;

                break;
        }

        httpContext.Response.StatusCode = problem.Status!.Value;
        await httpContext.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: cancellationToken);

        return true;
    }
}
