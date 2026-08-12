using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Configuration.Options;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    /// <summary>
    /// Membuat admin pertama kalau tabel admins masih kosong. Kredensial
    /// datang dari AdminSeedOptions, bukan literal di kode.
    /// Kalau admin sudah ada, password di config diabaikan — ganti password
    /// admin dilakukan lewat aplikasi, bukan dengan restart.
    /// </summary>
    public static async Task SeedAsync(
        AppDbContext dbContext,
        IPasswordHasher<AdminUser> passwordHasher,
        AdminSeedOptions seed)
    {
        if (await dbContext.Admins.AnyAsync())
        {
            return;
        }

        var admin = new AdminUser
        {
            Username = seed.Username
        };

        admin.PasswordHash = passwordHasher.HashPassword(
            admin,
            seed.Password);

        dbContext.Admins.Add(admin);

        await dbContext.SaveChangesAsync();
    }
}
