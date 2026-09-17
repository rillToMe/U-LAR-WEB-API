namespace u_lar_be.Features.Admin.Exams.Dtos;

/// <summary>Satu baris pada daftar ujian di web admin.</summary>
public sealed record ExamSummaryResponse(
    int Id,
    string Title,
    string? Description,
    int PassingScore,
    int DurationMinutes,
    bool IsActive,
    int QuestionCount,
    int StudentCount,
    DateTime CreatedAt
);

/// <summary>
/// Detail ujian beserta seluruh soal dan pilihan jawabannya — ini yang
/// dipakai halaman kelola bank soal, lengkap dengan kunci jawaban.
/// </summary>
public sealed record ExamDetailResponse(
    int Id,
    string Title,
    string? Description,
    int PassingScore,
    int DurationMinutes,
    bool IsActive,
    int StudentCount,
    IReadOnlyList<ExamQuestionResponse> Questions
);

public sealed record ExamQuestionResponse(
    int Id,
    int OrderNumber,
    string Type,
    string QuestionText,
    string? Image,
    /// <summary>Kunci jawaban soal uraian; null untuk pilihan ganda.</summary>
    string? AnswerKey,
    IReadOnlyList<ExamOptionResponse> Options
);

public sealed record ExamOptionResponse(
    int Id,
    string OptionText,
    bool IsCorrect
);
