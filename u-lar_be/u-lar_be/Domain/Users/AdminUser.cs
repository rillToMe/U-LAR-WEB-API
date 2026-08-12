namespace u_lar_be.Domain.Users;

using u_lar_be.Domain.Common;

/// <summary>
/// Pengelola konten via web admin. Sengaja tanpa atribut mahasiswa
/// (nim/email/progress) — cukup username + password.
/// Nama tipe pakai suffix "User" supaya tidak bentrok dengan
/// namespace Features.Admin.
/// </summary>
public class AdminUser : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}
