namespace u_lar_be.Features.Exams.Dtos;

/// <summary>
/// Satu ujian pada daftar ujian mahasiswa. <c>Status</c> memakai konstanta
/// <see cref="Domain.Exams.ExamSessionStatuses"/>; <c>ResultId</c> dipakai
/// klien untuk melanjutkan sesi yang masih berjalan, dan
/// <c>RemainingSeconds</c> hanya terisi untuk sesi yang berjalan supaya kartu
/// "Lanjutkan Ujian" bisa menampilkan sisa waktunya.
/// </summary>
public sealed record ExamListItemResponse(
    int Id,
    string Title,
    string? Description,
    int DurationMinutes,
    int PassingScore,
    int QuestionCount,
    string Status,
    int? ResultId,
    int? Attempt,
    int? RemainingSeconds,
    int? Score,
    bool? Passed
);
