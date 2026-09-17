using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Exams;

/// <summary>
/// Satu paket ujian yang dikerjakan mahasiswa lewat web ujian.
/// <see cref="DurationMinutes"/> dipakai server sebagai sumber tunggal
/// hitungan sisa waktu — bukan angka yang dikirim klien.
/// </summary>
public class Exam : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>Nilai minimal (0-100) supaya ujian dianggap lulus.</summary>
    public int PassingScore { get; set; } = 70;

    public int DurationMinutes { get; set; } = 30;

    /// <summary>Ujian nonaktif tidak muncul di daftar mahasiswa.</summary>
    public bool IsActive { get; set; } = true;

    public ICollection<ExamQuestion> Questions { get; set; } = [];

    public ICollection<ExamResult> Results { get; set; } = [];
}
