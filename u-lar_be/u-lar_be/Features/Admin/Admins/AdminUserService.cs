using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;
using u_lar_be.Features.Admin.Admins.DTOs;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Admin.Admins;

/// <summary>
/// Mengelola akun admin. Hanya boleh dipanggil dari controller yang
/// dijaga <c>[Authorize(Roles = UserRoles.SuperAdmin)]</c>.
///
/// Admin yang dibuat lewat sini SELALU punya role ADMIN biasa, bukan
/// superadmin. Semua akun superadmin adalah admin hasil seed bawaan, supaya
/// selalu ada satu akun yang tidak bisa terkunci orang dari panel.
/// </summary>
public sealed class AdminUserService(
    AppDbContext dbContext,
    IPasswordHasher<AdminUser> passwordHasher
) : IAdminUserService
{
    public async Task<IReadOnlyList<AdminListItemResponse>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Admins
            .AsNoTracking()
            .OrderByDescending(x => x.Role == UserRoles.SuperAdmin)
            .ThenBy(x => x.Username)
            .Select(x => new AdminListItemResponse(
                x.Id,
                x.Username,
                x.Role,
                x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminListItemResponse> CreateAsync(
        CreateAdminRequest request,
        CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();

        var usernameTaken = await dbContext.Admins
            .AnyAsync(
                x => x.Username == username,
                cancellationToken);

        if (usernameTaken)
        {
            throw new ConflictException(
                $"Username '{username}' sudah dipakai admin lain.",
                "username_taken");
        }

        var admin = new AdminUser
        {
            Username = username,

            // Admin yang dibuat dari sini SELALU admin biasa. Satu-satunya
            // akun superadmin adalah admin hasil seed bawaan, supaya selalu
            // ada akun yang tidak bisa terkunci orang dari panel.
            Role = UserRoles.Admin
        };

        admin.PasswordHash = passwordHasher.HashPassword(
            admin,
            request.Password);

        dbContext.Admins.Add(admin);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AdminListItemResponse(
            admin.Id,
            admin.Username,
            admin.Role,
            admin.CreatedAt);
    }

    public async Task<AdminListItemResponse> UpdateAsync(
        int adminId,
        UpdateAdminRequest request,
        CancellationToken cancellationToken)
    {
        var admin = await dbContext.Admins
            .SingleOrDefaultAsync(
                x => x.Id == adminId,
                cancellationToken);

        if (admin is null)
        {
            throw new NotFoundException("Admin tidak ditemukan.");
        }

        var newUsername = request.Username?.Trim();

        if (!string.IsNullOrEmpty(newUsername))
        {
            var usernameTaken = await dbContext.Admins
                .AnyAsync(
                    x => x.Username == newUsername && x.Id != adminId,
                    cancellationToken);

            if (usernameTaken)
            {
                throw new ConflictException(
                    $"Username '{newUsername}' sudah dipakai admin lain.",
                    "username_taken");
            }

            admin.Username = newUsername;
        }

        // Password kosong berarti "biarkan yang lama" supaya superadmin bisa
        // mengganti username saja tanpa wajib mengetik ulang password.
        if (!string.IsNullOrEmpty(request.Password))
        {
            admin.PasswordHash = passwordHasher.HashPassword(
                admin,
                request.Password);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AdminListItemResponse(
            admin.Id,
            admin.Username,
            admin.Role,
            admin.CreatedAt);
    }

    public async Task DeleteAsync(
        int adminId,
        int requestingAdminId,
        CancellationToken cancellationToken)
    {
        // Menahan akun sendiri: superadmin yang menghapus dirinya sendiri
        // akan langsung kehilangan akses ke halaman ini dan tidak ada cara
        // masuk lagi tanpa menyentuh database.
        if (adminId == requestingAdminId)
        {
            throw new ConflictException(
                "Admin tidak bisa menghapus akunnya sendiri.",
                "cannot_delete_self");
        }

        var admin = await dbContext.Admins
            .SingleOrDefaultAsync(
                x => x.Id == adminId,
                cancellationToken);

        if (admin is null)
        {
            throw new NotFoundException("Admin tidak ditemukan.");
        }

        if (admin.Role == UserRoles.SuperAdmin)
        {
            throw new ConflictException(
                "Admin superadmin bawaan tidak bisa dihapus.",
                "cannot_delete_superadmin");
        }

        dbContext.Admins.Remove(admin);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
