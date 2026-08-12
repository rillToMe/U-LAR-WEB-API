namespace u_lar_be.Features.Auth.Dtos;

public sealed record AdminLoginRequest(
    string Username,
    string Password
);
