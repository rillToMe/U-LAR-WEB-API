using System.ComponentModel.DataAnnotations;

namespace u_lar_be.Configuration.Options;

/// <summary>
/// Kredensial admin pertama dari section "AdminSeed" pada appsettings.
/// Password TIDAK disimpan di appsettings.json production — pakai
/// environment variable / user-secrets (AdminSeed__Password).
/// ValidateOnStart membuat app gagal boot kalau password kosong, jadi tidak
/// ada default password yang lolos ke production tanpa sadar.
/// </summary>
public sealed class AdminSeedOptions
{
    public const string SectionName = "AdminSeed";

    [Required]
    public string Username { get; init; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; init; } = string.Empty;
}
