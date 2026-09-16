using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class StudentRefreshTokenConfiguration
    : IEntityTypeConfiguration<StudentRefreshToken>
{
    public void Configure(EntityTypeBuilder<StudentRefreshToken> builder)
    {
        builder.ToTable("student_refresh_tokens");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TokenHash)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.ExpiresAt)
            .IsRequired();

        builder.HasIndex(x => x.TokenHash)
            .IsUnique();

        builder.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
