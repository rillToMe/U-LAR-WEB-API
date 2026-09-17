using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;

namespace u_lar_be.Domain.Exams;

/// <summary>
/// Satu percobaan ujian milik seorang mahasiswa. Baris ini dibuat saat ujian
/// dimulai, jadi <see cref="StartedAt"/> selalu bisa dipercaya server — sisa
/// waktu dihitung dari sini, bukan dari jam di perangkat mahasiswa.
/// <see cref="FinishedAt"/> null berarti ujian masih berjalan.
/// </summary>
public class ExamResult : BaseEntity
{
    public int StudentId { get; set; }

    public int ExamId { get; set; }

    /// <summary>Percobaan ke-berapa untuk ujian ini.</summary>
    public int Attempt { get; set; } = 1;

    public DateTime StartedAt { get; set; }

    public DateTime? FinishedAt { get; set; }

    /// <summary>Total detik pengerjaan saat dikumpulkan.</summary>
    public int DurationSeconds { get; set; }

    /// <summary>Nilai 0-100 dari soal pilihan ganda yang dinilai otomatis.</summary>
    public int Score { get; set; }

    public bool Passed { get; set; }

    public Student Student { get; set; } = null!;

    public Exam Exam { get; set; } = null!;

    public ICollection<ExamAnswer> Answers { get; set; } = [];
}
