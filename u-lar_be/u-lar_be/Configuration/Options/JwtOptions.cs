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
}
