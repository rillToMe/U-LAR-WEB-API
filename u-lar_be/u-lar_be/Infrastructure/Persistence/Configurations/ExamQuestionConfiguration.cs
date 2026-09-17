using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Exams;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class ExamQuestionConfiguration
    : IEntityTypeConfiguration<ExamQuestion>
{
    public void Configure(EntityTypeBuilder<ExamQuestion> builder)
    {
        builder.ToTable("exam_questions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.QuestionText)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.Image)
            .HasMaxLength(300);

        builder.Property(x => x.OrderNumber)
            .IsRequired();

        // Soal selalu dibaca berdasarkan urutannya di dalam satu ujian.
        builder.HasIndex(x => new { x.ExamId, x.OrderNumber });

        builder.HasMany(x => x.Options)
            .WithOne(x => x.Question)
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
