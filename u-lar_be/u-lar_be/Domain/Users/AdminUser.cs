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

    /// <summary>
    /// Role admin ini: <see cref="UserRoles.Admin"/> atau
    /// <see cref="UserRoles.SuperAdmin"/>. Disimpan sebagai string, bukan
    /// boolean, supaya role baru bisa ditambahkan tanpa mengubah nilai yang
    /// sudah tersimpan atau menambah kolom baru. Role ikut diklaim ke JWT
    /// saat login, jadi [Authorize(Roles = ...)] bisa membedakannya.
    /// </summary>
    public string Role { get; set; } = UserRoles.Admin;

    /// <summary>
    /// Admin nonaktif ditolak di <c>OnTokenValidated</c> walau tokennya
    /// masih punya masa berlaku, jadi menonaktifkan admin berlaku dalam
    /// batas umur access token dan tidak perlu mencabut baris datanya.
    /// </summary>
    public bool IsActive { get; set; } = true;
}
