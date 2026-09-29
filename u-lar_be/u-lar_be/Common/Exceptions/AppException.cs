namespace u_lar_be.Common.Exceptions;

/// <summary>
/// Exception yang dilempar sengaja oleh layer Features/Domain dan sudah
/// membawa HTTP status code. Selain turunan ini, semua exception dianggap
/// bug dan dilaporkan sebagai 500.
///
/// <c>Code</c> adalah kode stabil yang dibaca frontend untuk menerjemahkan
/// pesan ke bahasa user — pesan exception hanya untuk log / tampilan teknis.
/// </summary>
public abstract class AppException(
    int statusCode,
    string message,
    string? code = null
) : Exception(message)
{
    public int StatusCode { get; } = statusCode;

    /// <summary>Kode error stabil untuk konsumsi client (opsional).</summary>
    public string? Code { get; } = code;
}

public sealed class NotFoundException(string message, string? code = null)
    : AppException(StatusCodes.Status404NotFound, message, code ?? "not_found");

public sealed class ValidationFailedException(
    string message,
    IReadOnlyDictionary<string, string[]>? errors = null,
    string? code = null
) : AppException(StatusCodes.Status400BadRequest, message, code ?? "validation_failed")
{
    /// <summary>Field-level errors per nama field → daftar pesan.</summary>
    public IReadOnlyDictionary<string, string[]> Errors { get; } =
        errors ?? new Dictionary<string, string[]>();
}

public sealed class ConflictException(string message, string? code = null)
    : AppException(StatusCodes.Status409Conflict, message, code ?? "conflict");

public sealed class ForbiddenException(string message, string? code = null)
    : AppException(StatusCodes.Status403Forbidden, message, code ?? "forbidden");

public sealed class UnauthorizedException(string message, string? code = null)
    : AppException(StatusCodes.Status401Unauthorized, message, code ?? "unauthorized");
