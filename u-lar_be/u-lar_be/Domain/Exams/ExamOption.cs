using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Exams;

public class ExamOption : BaseEntity
{
    public int QuestionId { get; set; }

    public string OptionText { get; set; } = string.Empty;

    /// <summary>
    /// TIDAK pernah dikirim ke klien selama ujian berjalan — hanya dipakai
    /// server saat menghitung nilai.
    /// </summary>
    public bool IsCorrect { get; set; }

    public ExamQuestion Question { get; set; } = null!;
}
