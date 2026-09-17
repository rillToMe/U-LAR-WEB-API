namespace u_lar_be.Features.Exams.Dtos;

/// <summary>
/// Balasan auto-save. <c>RemainingSeconds</c> ikut dikirim supaya jam di
/// perangkat menyesuaikan diri dengan hitungan server, dan
/// <c>AnsweredCount</c> langsung bisa dipakai di ringkasan soal.
/// </summary>
public sealed record SaveAnswerResponse(
    int QuestionId,
    int AnsweredCount,
    int TotalQuestions,
    int RemainingSeconds,
    DateTime SavedAt
);
