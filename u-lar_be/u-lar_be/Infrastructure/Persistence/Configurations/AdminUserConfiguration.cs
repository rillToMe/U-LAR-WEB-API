using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.ToTable("admins");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Username)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.PasswordHash)
            .IsRequired();

        builder.HasIndex(x => x.Username)
            .IsUnique();
    }
}
