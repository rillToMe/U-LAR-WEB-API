namespace u_lar_be.Common.Exceptions;

/// <summary>
/// Exception yang dilempar sengaja oleh layer Features/Domain dan sudah
/// membawa HTTP status code. Selain turunan ini, semua exception dianggap
/// bug dan dilaporkan sebagai 500.
/// </summary>
public abstract class AppException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed class NotFoundException(string message)
    : AppException(StatusCodes.Status404NotFound, message);

public sealed class ValidationFailedException(string message)
    : AppException(StatusCodes.Status400BadRequest, message);

public sealed class ConflictException(string message)
    : AppException(StatusCodes.Status409Conflict, message);

public sealed class ForbiddenException(string message)
    : AppException(StatusCodes.Status403Forbidden, message);
