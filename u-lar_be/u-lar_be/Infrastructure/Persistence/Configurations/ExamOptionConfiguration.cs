using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Exams;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class ExamOptionConfiguration
    : IEntityTypeConfiguration<ExamOption>
{
    public void Configure(EntityTypeBuilder<ExamOption> builder)
    {
        builder.ToTable("exam_options");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OptionText)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.IsCorrect)
            .IsRequired();

        builder.HasIndex(x => x.QuestionId);
    }
}
