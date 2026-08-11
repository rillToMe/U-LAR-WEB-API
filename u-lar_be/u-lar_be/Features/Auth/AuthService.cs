using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using u_lar_be.Configuration.Options;
using u_lar_be.Domain.Users;
using u_lar_be.Features.Auth.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Auth;

public sealed class AuthService(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    IOptions<JwtOptions> jwtOptions
) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .SingleOrDefaultAsync(
                x => x.Nim == request.Nim,
                cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedAccessException(
                "NIM atau password salah.");
        }

        var passwordResult =
            passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException(
                "NIM atau password salah.");
        }

        user.LastLoginAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var accessToken = GenerateAccessToken(user);

        return new LoginResponse(
            user.Id,
            user.Nim,
            user.Name,
            user.Email,
            user.Role,
            accessToken);
    }

    private string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()),

            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new(
                ClaimTypes.Name,
                user.Name),

            new(
                ClaimTypes.Email,
                user.Email),

            new(
                ClaimTypes.Role,
                user.Role),

            new(
                "nim",
                user.Nim)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwt.Key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                _jwt.AccessTokenMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}