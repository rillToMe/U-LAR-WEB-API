namespace u_lar_be.Features.Auth.Dtos;

/// <summary>
/// <paramref name="RefreshToken"/> disimpan client untuk memperpanjang sesi
/// saat access token kedaluwarsa, dan bisa dicabut dari server saat admin
/// keluar. <paramref name="ExpiresInSeconds"/> dipakai client untuk
/// menjadwalkan refresh sendiri, jadi tidak perlu menebak kapan token
/// berakhir dari lokal saja.
/// </summary>
public sealed record AdminLoginResponse(
    int AdminId,
    string Username,
    string Role,
    string AccessToken,
    string RefreshToken,
    int ExpiresInSeconds);
