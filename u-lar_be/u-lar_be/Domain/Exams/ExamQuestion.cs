using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Exams;

public class ExamQuestion : BaseEntity
{
    public int ExamId { get; set; }

    public ExamQuestionType Type { get; set; } = ExamQuestionType.MultipleChoice;

    public string QuestionText { get; set; } = string.Empty;

    public string? Image { get; set; }

    /// <summary>
    /// Kunci jawaban / jawaban acuan untuk soal uraian. Dipakai admin sebagai
    /// pengingat saat menilai manual — tidak pernah dikirim ke mahasiswa.
    /// Null untuk soal pilihan ganda.
    /// </summary>
    public string? AnswerKey { get; set; }

    /// <summary>Urutan tampil soal, dimulai dari 1.</summary>
    public int OrderNumber { get; set; }

    public Exam Exam { get; set; } = null!;

    /// <summary>Kosong untuk soal uraian.</summary>
    public ICollection<ExamOption> Options { get; set; } = [];
}
