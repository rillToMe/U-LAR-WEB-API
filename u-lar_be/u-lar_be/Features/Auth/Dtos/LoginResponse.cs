namespace u_lar_be.Features.Auth.Dtos;

public sealed record LoginResponse(
    int UserId,
    string Nim,
    string Name,
    string Email,
    string Role,
    string AccessToken
);