namespace u_lar_be.Features.Admin.Admins.DTOs;

/// <summary>
/// Satu baris di daftar admin. PasswordHash tidak pernah ikut keluar.
/// <c>Role</c> berisi <c>ADMIN</c> atau <c>SUPER_ADMIN</c>.
/// </summary>
public sealed record AdminListItemResponse(
    int Id,
    string Username,
    string Role,
    DateTime CreatedAt,
    bool IsActive);
