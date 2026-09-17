using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Exams;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class ExamResultConfiguration
    : IEntityTypeConfiguration<ExamResult>
{
    public void Configure(EntityTypeBuilder<ExamResult> builder)
    {
        builder.ToTable("exam_results");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Attempt)
            .IsRequired();

        builder.Property(x => x.StartedAt)
            .IsRequired();

        builder.Property(x => x.DurationSeconds)
            .IsRequired();

        builder.Property(x => x.Score)
            .IsRequired();

        builder.Property(x => x.Passed)
            .IsRequired();

        // Satu percobaan hanya boleh sekali per ujian.
        builder.HasIndex(x => new { x.StudentId, x.ExamId, x.Attempt })
            .IsUnique();

        // Pencarian sesi yang masih berjalan / daftar nilai mahasiswa.
        builder.HasIndex(x => new { x.StudentId, x.ExamId });

        builder.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Answers)
            .WithOne(x => x.Result)
            .HasForeignKey(x => x.ResultId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
