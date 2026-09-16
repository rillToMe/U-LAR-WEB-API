namespace u_lar_be.Features.Auth.Dtos;

public sealed record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken);
