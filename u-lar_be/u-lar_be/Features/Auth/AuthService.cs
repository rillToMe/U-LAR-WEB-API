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
    IOptions<JwtOptions> jwtOptions,
    ILogger<AuthService> logger
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
            logger.LogWarning(
                "Login mahasiswa gagal: NIM {Nim} tidak ditemukan atau nonaktif.",
                request.Nim);
            throw new UnauthorizedException(
                "NIM atau password salah.", "invalid_credentials");
        }

        var passwordResult =
            studentPasswordHasher.VerifyHashedPassword(
                student,
                student.PasswordHash,
                request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            logger.LogWarning(
                "Login mahasiswa gagal: password salah untuk NIM {Nim}.",
                request.Nim);
            throw new UnauthorizedException(
                "NIM atau password salah.", "invalid_credentials");
        }

        logger.LogInformation(
            "Login mahasiswa berhasil: {Nim} (id {StudentId}).",
            request.Nim, student.Id);

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
            logger.LogWarning(
                "Refresh token ditolak: tidak valid, kedaluwarsa, dicabut, atau akun nonaktif.");
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
            logger.LogWarning(
                "Login admin gagal: username {Username} tidak ditemukan.",
                request.Username);
            throw new UnauthorizedException(
                "Username atau password salah.", "invalid_credentials");
        }

        var passwordResult =
            adminPasswordHasher.VerifyHashedPassword(
                admin,
                admin.PasswordHash,
                request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            logger.LogWarning(
                "Login admin gagal: password salah untuk username {Username}.",
                request.Username);
            throw new UnauthorizedException(
                "Username atau password salah.", "invalid_credentials");
        }

        // Role dibaca dari kolom admins.role, bukan dari tipe token, supaya
        // [Authorize(Roles = ...)] bisa membedakan admin biasa dari superadmin.
        // Nilai tak dikenal (atau kosong, mis. baris lama sebelum kolom role
        // ada) diperlakukan sebagai admin biasa supaya akses tidak hilang.
        var isSuperAdmin = admin.Role == UserRoles.SuperAdmin;
        var role = isSuperAdmin ? UserRoles.SuperAdmin : UserRoles.Admin;

        if (admin.Role != role)
        {
            logger.LogWarning(
                "Role admin {Username} tidak dikenal ('{Role}'), diperlakukan sebagai {Fallback}.",
                admin.Username, admin.Role, role);
        }

        logger.LogInformation(
            "Login admin berhasil: {Username} (id {AdminId}), role {Role}.",
            admin.Username, admin.Id, role);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new(ClaimTypes.Name, admin.Username),

            // Setiap admin selalu boleh masuk endpoint yang dijaga
            // [Authorize(Roles = UserRoles.Admin)].
            new(ClaimTypes.Role, UserRoles.Admin)
        };

        // Superadmin adalah admin yang juga punya hak tambahan, jadi tokennya
        // membawa dua role claim. Dengan begitu [Authorize(Roles = "ADMIN")]
        // tetap berlaku untuknya, dan hanya dia yang lolos
        // [Authorize(Roles = "SUPER_ADMIN")] di endpoint Kelola Admin.
        if (isSuperAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, UserRoles.SuperAdmin));
        }

        var accessToken = WriteToken(
            _jwt.AdminAccessTokenMinutes,
            claims);

        return new AdminLoginResponse(
            admin.Id,
            admin.Username,
            role,
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
