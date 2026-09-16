using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using u_lar_be.Common.Exceptions;
using u_lar_be.Configuration.Options;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;
using u_lar_be.Features.Auth.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Auth;

/// <summary>
/// Admin dan mahasiswa disimpan di tabel berbeda, jadi login-nya juga
/// terpisah: mahasiswa pakai NIM, admin pakai username. Claim "role" di token
/// yang membedakan keduanya — id boleh bertabrakan antar tabel.
/// </summary>
public sealed class AuthService(
    AppDbContext dbContext,
    IPasswordHasher<Student> studentPasswordHasher,
    IPasswordHasher<AdminUser> adminPasswordHasher,
    IOptions<JwtOptions> jwtOptions
) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .SingleOrDefaultAsync(
                x => x.Nim == request.Nim,
                cancellationToken);

        if (student is null || !student.IsActive)
        {
            throw new UnauthorizedException(
                "NIM atau password salah.");
        }

        var passwordResult =
            studentPasswordHasher.VerifyHashedPassword(
                student,
                student.PasswordHash,
                request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException(
                "NIM atau password salah.");
        }

        student.LastLoginAt = DateTime.UtcNow;

        var accessToken = WriteStudentToken(student);
        var refreshToken = CreateRefreshToken(student.Id);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new LoginResponse(
            student.Id,
            student.Nim,
            student.Name,
            student.Email,
            UserRoles.Student,
            accessToken,
            refreshToken);
    }

    public async Task<RefreshTokenResponse> RefreshStudentTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(request.RefreshToken);
        var storedToken = await dbContext.StudentRefreshTokens
            .Include(x => x.Student)
            .SingleOrDefaultAsync(
                x => x.TokenHash == tokenHash,
                cancellationToken);

        if (storedToken is null
            || storedToken.RevokedAt is not null
            || storedToken.ExpiresAt <= DateTime.UtcNow
            || !storedToken.Student.IsActive)
        {
            throw new UnauthorizedException("Refresh token tidak valid.");
        }

        storedToken.RevokedAt = DateTime.UtcNow;

        var accessToken = WriteStudentToken(storedToken.Student);
        var refreshToken = CreateRefreshToken(storedToken.StudentId);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResponse(accessToken, refreshToken);
    }

    /// <summary>
    /// Logout mahasiswa: refresh token yang dikirim langsung dicabut supaya
    /// tidak bisa dipakai memperbarui access token lagi. Sengaja idempotent —
    /// token yang tidak ditemukan atau sudah dicabut tidak dianggap error,
    /// karena client cukup menghapus token lokalnya.
    /// </summary>
    public async Task LogoutStudentAsync(
        LogoutRequest request,
        CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(request.RefreshToken);
        var storedToken = await dbContext.StudentRefreshTokens
            .SingleOrDefaultAsync(
                x => x.TokenHash == tokenHash,
                cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null)
        {
            return;
        }

        storedToken.RevokedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdminLoginResponse> LoginAdminAsync(
        AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        var admin = await dbContext.Admins
            .SingleOrDefaultAsync(
                x => x.Username == request.Username,
                cancellationToken);

        if (admin is null)
        {
            throw new UnauthorizedException(
                "Username atau password salah.");
        }

        var passwordResult =
            adminPasswordHasher.VerifyHashedPassword(
                admin,
                admin.PasswordHash,
                request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException(
                "Username atau password salah.");
        }

        var accessToken = WriteToken(
            _jwt.AdminAccessTokenMinutes,
        [
            new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new Claim(ClaimTypes.Name, admin.Username),
            new Claim(ClaimTypes.Role, UserRoles.Admin)
        ]);

        return new AdminLoginResponse(
            admin.Id,
            admin.Username,
            UserRoles.Admin,
            accessToken);
    }

    private string WriteToken(
        int expiresInMinutes,
        IEnumerable<Claim> claims)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwt.Key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                expiresInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    private string WriteStudentToken(Student student)
    {
        return WriteToken(
            _jwt.StudentAccessTokenMinutes,
        [
            new Claim(JwtRegisteredClaimNames.Sub, student.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, student.Id.ToString()),
            new Claim(ClaimTypes.Name, student.Name),
            new Claim(ClaimTypes.Email, student.Email),
            new Claim(ClaimTypes.Role, UserRoles.Student),
            new Claim("nim", student.Nim)
        ]);
    }

    private string CreateRefreshToken(int studentId)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        dbContext.StudentRefreshTokens.Add(new StudentRefreshToken
        {
            StudentId = studentId,
            TokenHash = HashToken(token),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays)
        });

        return token;
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
