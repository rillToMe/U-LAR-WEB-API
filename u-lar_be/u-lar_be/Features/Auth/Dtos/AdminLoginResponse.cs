namespace u_lar_be.Features.Auth.Dtos;

public sealed record AdminLoginResponse(
    int AdminId,
    string Username,
    string Role,
    string AccessToken
);
