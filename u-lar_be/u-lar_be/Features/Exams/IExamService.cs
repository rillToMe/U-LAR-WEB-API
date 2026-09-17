using u_lar_be.Features.Exams.Dtos;

namespace u_lar_be.Features.Exams;

/// <summary>
/// Sisi mahasiswa dari fitur ujian: daftar ujian, membuka sesi, auto-save
/// jawaban per soal, dan mengumpulkan ujian.
/// </summary>
public interface IExamService
{
    Task<IReadOnlyList<ExamListItemResponse>> GetExamsAsync(
        int studentId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Memulai ujian. Kalau mahasiswa sudah punya sesi yang masih berjalan,
    /// sesi itu yang dikembalikan (bukan membuat percobaan baru) supaya
    /// menutup aplikasi di tengah ujian tidak menghanguskan jawaban.
    /// </summary>
    Task<ExamSessionResponse> StartAsync(
        int studentId,
        int examId,
        CancellationToken cancellationToken);

    Task<ExamSessionResponse> GetSessionAsync(
        int studentId,
        int resultId,
        CancellationToken cancellationToken);

    Task<SaveAnswerResponse> SaveAnswerAsync(
        int studentId,
        int resultId,
        int questionId,
        SaveAnswerRequest request,
        CancellationToken cancellationToken);

    /// <summary>
    /// Menandai / melepas tanda "ragu-ragu" pada satu soal. Terpisah dari
    /// auto-save jawaban karena soal boleh ditandai walau belum dijawab.
    /// </summary>
    Task<SaveQuestionFlagResponse> SetQuestionFlagAsync(
        int studentId,
        int resultId,
        int questionId,
        SaveQuestionFlagRequest request,
        CancellationToken cancellationToken);

    Task<SubmitExamResponse> SubmitAsync(
        int studentId,
        int resultId,
        CancellationToken cancellationToken);

    Task<SubmitExamResponse> GetSummaryAsync(
        int studentId,
        int resultId,
        CancellationToken cancellationToken);
}
