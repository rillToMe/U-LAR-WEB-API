using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Configuration.Options;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    /// <summary>
    /// Membuat admin pertama kalau tabel admins masih kosong. Kredensial
    /// datang dari AdminSeedOptions, bukan literal di kode.
    /// Kalau admin sudah ada, password di config diabaikan — ganti password
    /// admin dilakukan lewat aplikasi, bukan dengan restart.
    ///
    /// Admin hasil seed otomatis jadi SUPER_ADMIN. Database yang sudah terisi
    /// sebelum kolom role ada diperbaiki di sini: kalau tidak ada satu pun
    /// superadmin, admin tertua dinaikkan. Jadi tidak perlu seeding manual
    /// setelah migrate.
    /// </summary>
    public static async Task SeedAsync(
        AppDbContext dbContext,
        IPasswordHasher<AdminUser> passwordHasher,
        AdminSeedOptions seed)
    {
        var hasAnyAdmin = await dbContext.Admins.AnyAsync();

        if (!hasAnyAdmin)
        {
            var admin = new AdminUser
            {
                Username = seed.Username,
                Role = UserRoles.SuperAdmin
            };

            admin.PasswordHash = passwordHasher.HashPassword(
                admin,
                seed.Password);

            dbContext.Admins.Add(admin);

            await dbContext.SaveChangesAsync();

            return;
        }

        var hasSuperAdmin = await dbContext.Admins
            .AnyAsync(x => x.Role == UserRoles.SuperAdmin);

        if (hasSuperAdmin)
        {
            return;
        }

        var oldestAdmin = await dbContext.Admins
            .OrderBy(x => x.Id)
            .FirstAsync();

        oldestAdmin.Role = UserRoles.SuperAdmin;

        await dbContext.SaveChangesAsync();
    }
}
