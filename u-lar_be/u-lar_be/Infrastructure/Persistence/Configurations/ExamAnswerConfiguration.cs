using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Exams;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class ExamAnswerConfiguration
    : IEntityTypeConfiguration<ExamAnswer>
{
    public void Configure(EntityTypeBuilder<ExamAnswer> builder)
    {
        builder.ToTable("exam_answers");

        builder.HasKey(x => x.Id);

        // Auto-save berkali-kali untuk soal yang sama harus menimpa baris yang
        // sudah ada, bukan menumpuk. Index ini yang menjaminnya.
        builder.HasIndex(x => new { x.ResultId, x.QuestionId })
            .IsUnique();

        builder.HasOne(x => x.Question)
            .WithMany()
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Opsi bisa diganti admin setelah ujian; jawaban lama jangan sampai
        // memblokir perubahan itu, cukup dilepas jadi null.
        builder.HasOne(x => x.SelectedOption)
            .WithMany()
            .HasForeignKey(x => x.SelectedOptionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
