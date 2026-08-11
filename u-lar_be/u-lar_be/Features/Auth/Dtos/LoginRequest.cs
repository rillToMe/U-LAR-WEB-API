namespace u_lar_be.Features.Auth.Dtos;

public sealed record LoginRequest(
    string Nim,
    string Password
);