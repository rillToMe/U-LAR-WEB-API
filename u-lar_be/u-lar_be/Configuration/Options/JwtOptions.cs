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

    [Range(1, 1440)]
    public int AccessTokenMinutes { get; init; }

    /// <summary>
    /// Masa berlaku token admin. Dibatasi 60 menit untuk menjaga keamanan
    /// sesi aktif admin.
    /// </summary>
    [Range(1, 60)]
    public int AdminAccessTokenMinutes { get; init; } = 60;

    /// <summary>
    /// Masa berlaku token mahasiswa. Mahasiswa login dari game dan tidak
    /// memakai session server — token dibuat sangat lama (persistent login,
    /// login ulang cukup sekali) dan disimpan di perangkat.
    /// </summary>
    [Range(1, 525600)]
    public int StudentAccessTokenMinutes { get; init; } = 525600;
}
