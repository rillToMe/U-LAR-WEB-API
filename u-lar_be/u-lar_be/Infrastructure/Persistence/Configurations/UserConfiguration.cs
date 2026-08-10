using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Nim)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.PasswordHash)
            .IsRequired();

        builder.Property(x => x.Role)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.LastLoginAt);

        builder.HasIndex(x => x.Nim)
            .IsUnique();

        builder.HasIndex(x => x.Email)
            .IsUnique();
    }
}