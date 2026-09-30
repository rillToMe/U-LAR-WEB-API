namespace u_lar_be.Configuration;

/// <summary>
/// Nama policy rate limit. Dipakai sebagai string di atribut
/// <c>[EnableRateLimiting]</c> pada controller, jadi harus berada di
/// namespace yang bisa diimpor controller.
/// </summary>
public static class RateLimitPolicy
{
    /// <summary>
    /// Login admin dibatasi per IP. Endpoint ini tidak punya auth apa pun
    /// untuk dilewati, jadi tanpa pembatas, brute force password hanya
    /// dibatasi kecepatan internet.
    /// </summary>
    public const string AdminLogin = "admin-login";
}
