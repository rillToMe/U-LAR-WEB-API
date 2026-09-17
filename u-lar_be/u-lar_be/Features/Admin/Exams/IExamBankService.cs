using u_lar_be.Features.Admin.Exams.Dtos;

namespace u_lar_be.Features.Admin.Exams;

/// <summary>
/// Pengelolaan bank soal dari web admin: ujian, soal, dan pilihan jawaban,
/// plus penilaian manual jawaban uraian mahasiswa.
/// </summary>
public interface IExamBankService
{
    Task<IReadOnlyList<ExamSummaryResponse>> GetExamsAsync(
        CancellationToken cancellationToken);

    Task<ExamDetailResponse> GetExamAsync(
        int examId,
        CancellationToken cancellationToken);

    Task<int> CreateExamAsync(
        CreateExamRequest request,
        CancellationToken cancellationToken);

    Task UpdateExamAsync(
        int examId,
        UpdateExamRequest request,
        CancellationToken cancellationToken);

    Task UpdateStatusAsync(
        int examId,
        bool isActive,
        CancellationToken cancellationToken);

    Task DeleteExamAsync(
        int examId,
        CancellationToken cancellationToken);

    Task<int> CreateQuestionAsync(
        int examId,
        SaveQuestionRequest request,
        CancellationToken cancellationToken);

    Task UpdateQuestionAsync(
        int questionId,
        SaveQuestionRequest request,
        CancellationToken cancellationToken);

    Task DeleteQuestionAsync(
        int questionId,
        CancellationToken cancellationToken);

    /// <summary>Jawaban uraian satu ujian dikelompokkan per mahasiswa.</summary>
    Task<EssayGradingResponse> GetEssayGradingAsync(
        int examId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Menyimpan nilai jawaban uraian, lalu menghitung ulang nilai akhir
    /// percobaan ujian yang bersangkutan.
    /// </summary>
    Task<EssayGradingResultResponse> GradeEssaysAsync(
        int resultId,
        GradeEssayBatchRequest request,
        CancellationToken cancellationToken);
}
