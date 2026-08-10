namespace u_lar_be.Features.Auth.Dtos;

public sealed record RegisterRequest(
    string Nim,
    string Name,
    string Email,
    string Password
);