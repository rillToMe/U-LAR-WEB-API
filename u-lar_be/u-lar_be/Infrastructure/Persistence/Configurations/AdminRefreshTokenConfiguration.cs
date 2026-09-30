using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class AdminRefreshTokenConfiguration
    : IEntityTypeConfiguration<AdminRefreshToken>
{
    public void Configure(EntityTypeBuilder<AdminRefreshToken> builder)
    {
        builder.ToTable("admin_refresh_tokens");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TokenHash)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.ExpiresAt)
            .IsRequired();

        builder.HasIndex(x => x.TokenHash)
            .IsUnique();

        builder.HasOne(x => x.Admin)
            .WithMany()
            .HasForeignKey(x => x.AdminId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
