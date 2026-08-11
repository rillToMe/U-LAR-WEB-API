using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher)
    {
        var adminExists = await dbContext.Users
            .AnyAsync(x => x.Role == UserRoles.Admin);

        if (adminExists)
        {
            return;
        }

        var admin = new User
        {
            Nim = "ADMIN001",
            Name = "U-LAR Administrator",
            Email = "admin@ular.local",
            Role = UserRoles.Admin,
            IsActive = true
        };

        admin.PasswordHash = passwordHasher.HashPassword(
            admin,
            "Admin123!");

        dbContext.Users.Add(admin);

        await dbContext.SaveChangesAsync();
    }
}