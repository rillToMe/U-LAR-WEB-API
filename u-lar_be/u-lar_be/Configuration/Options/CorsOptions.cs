using System.ComponentModel.DataAnnotations;

namespace u_lar_be.Configuration.Options;

/// <summary>
/// Daftar origin yang boleh mengakses API (CORS) dari section "Cors".
/// Satu entri "*" berarti semua origin diizinkan (AllowAnyOrigin).
/// Origin LAN (mis. IP Wi-Fi laptop) ditambahkan lewat
/// appsettings.Development.json, jadi tidak perlu ubah kode saat IP berubah.
/// </summary>
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    [Required, MinLength(1)]
    public string[] AllowedOrigins { get; init; } = [];
}
