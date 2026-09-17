using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Exams;

/// <summary>
/// Satu jawaban mahasiswa untuk satu soal. Baris ini di-upsert setiap kali
/// auto-save dipanggil, jadi cukup ada satu baris per (result, soal) —
/// lihat index unik di <c>ExamAnswerConfiguration</c>.
/// </summary>
public class ExamAnswer : BaseEntity
{
    public int ResultId { get; set; }

    public int QuestionId { get; set; }

    /// <summary>Terisi untuk soal pilihan ganda.</summary>
    public int? SelectedOptionId { get; set; }

    /// <summary>Terisi untuk soal uraian.</summary>
    public string? AnswerText { get; set; }

    /// <summary>
    /// Hasil penilaian: true/false untuk pilihan ganda, null untuk uraian yang
    /// belum dinilai admin.
    /// </summary>
    public bool? IsCorrect { get; set; }

    /// <summary>
    /// Nilai uraian 0-100 dari penilaian admin. Null untuk jawaban pilihan
    /// ganda maupun uraian yang belum dinilai.
    /// </summary>
    public int? Score { get; set; }

    /// <summary>
    /// Tanda "ragu-ragu" dari mahasiswa: soal yang ingin ditinjau ulang
    /// sebelum ujian dikumpulkan. Murni penanda urutan pengerjaan dan tidak
    /// ikut dinilai, jadi barisnya boleh ada walaupun jawabannya masih kosong.
    /// </summary>
    public bool IsFlagged { get; set; }

    public ExamResult Result { get; set; } = null!;

    public ExamQuestion Question { get; set; } = null!;

    public ExamOption? SelectedOption { get; set; }
}
