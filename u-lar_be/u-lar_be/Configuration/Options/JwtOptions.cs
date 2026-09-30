using System.ComponentModel.DataAnnotations;

namespace u_lar_be.Configuration.Options;

/// <summary>
/// Konfigurasi JWT dari section "Jwt" pada appsettings.
/// Key TIDAK disimpan di appsettings.json production — pakai environment
/// variable / user-secrets (Jwt__Key).
/// </summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required, MinLength(32)]
    public string Key { get; init; } = string.Empty;

    [Required]
    public string Issuer { get; init; } = string.Empty;

    [Required]
    public string Audience { get; init; } = string.Empty;

    /// <summary>
    /// Masa berlaku token admin. Sengaja pendek (15 menit) karena tiap
    /// request divalidasi ulang ke database — role yang berubah atau akun
    /// yang dinonaktifkan baru berlaku maksimal segitu. Perpanjangan
    /// dilakukan lewat refresh token, bukan dengan access token yang lebih
    /// panjang.
    /// </summary>
    [Range(1, 60)]
    public int AdminAccessTokenMinutes { get; init; } = 15;

    /// <summary>
    /// Masa berlaku refresh token admin kalau tidak dipakai (idle). Diperpanjang
    /// setiap kali token dipakai, jadi sesi yang aktif terus berjalan.
    /// </summary>
    [Range(1, 90)]
    public int AdminRefreshTokenIdleDays { get; init; } = 1;

    /// <summary>
    /// Plafon total satu sesi admin, dihitung dari saat refresh token
    /// pertama dibuat. Setelah lewat, admin wajib login ulang. Ini yang
    /// menghentikan refresh token curian yang terus "dihidupkan" dari
    /// komputer bersama.
    /// </summary>
    [Range(1, 365)]
    public int AdminRefreshTokenAbsoluteDays { get; init; } = 8;

    /// <summary>
    /// Masa berlaku token mahasiswa. Mahasiswa login dari game dan tidak
    /// memakai session server — token dibuat sangat lama (persistent login,
    /// login ulang cukup sekali) dan disimpan di perangkat.
    /// </summary>
    [Range(1, 525600)]
    public int StudentAccessTokenMinutes { get; init; } = 525600;

    [Range(1, 3650)]
    public int RefreshTokenDays { get; init; } = 30;
}
