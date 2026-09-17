namespace u_lar_be.Features.Exams.Dtos;

/// <summary>
/// Hasil akhir setelah ujian dikumpulkan. Nilai dihitung dari soal pilihan
/// ganda ditambah uraian yang sudah dinilai admin;
/// <c>PendingEssayCount</c> memberi tahu berapa soal uraian yang masih
/// menunggu penilaian manual — nilainya bisa berubah setelah dinilai.
/// </summary>
public sealed record SubmitExamResponse(
    int ResultId,
    int ExamId,
    string ExamTitle,
    int Score,
    int PassingScore,
    bool Passed,
    int CorrectCount,
    int WrongCount,
    int UnansweredCount,
    int TotalQuestions,
    int PendingEssayCount,
    int DurationSeconds,
    DateTime StartedAt,
    DateTime FinishedAt,
    IReadOnlyList<SubmitExamItemResponse> Items
);

public sealed record SubmitExamItemResponse(
    int QuestionId,
    int OrderNumber,
    string Type,
    string QuestionText,
    bool Answered,
    bool? IsCorrect,
    /// <summary>Nilai uraian 0-100, null jika belum dinilai atau bukan uraian.</summary>
    int? Score
);
