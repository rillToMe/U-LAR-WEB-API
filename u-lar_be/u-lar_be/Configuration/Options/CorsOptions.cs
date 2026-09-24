using System.ComponentModel.DataAnnotations;

namespace u_lar_be.Configuration.Options;

/// <summary>
/// Daftar origin yang boleh mengakses API (CORS) dari section "Cors".
/// Satu entri "*" berarti semua origin diizinkan (AllowAnyOrigin).
/// Daftar origin yang boleh mengakses API (CORS) dari section "Cors"
/// di appsettings.json. Satu entri "*" berarti semua origin diizinkan.
/// </summary>
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    [Required, MinLength(1)]
    public string[] AllowedOrigins { get; init; } = [];
}
