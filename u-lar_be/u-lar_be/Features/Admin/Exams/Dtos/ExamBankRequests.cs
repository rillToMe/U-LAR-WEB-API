namespace u_lar_be.Features.Admin.Exams.Dtos;

public sealed record CreateExamRequest(
    string Title,
    string? Description,
    int PassingScore,
    int DurationMinutes
);

/// <summary>
/// Status aktif sengaja tidak ikut di sini — ada endpoint sendiri supaya
/// mengubah metadata tidak diam-diam mengubah status ujian.
/// </summary>
public sealed record UpdateExamRequest(
    string Title,
    string? Description,
    int PassingScore,
    int DurationMinutes
);

public sealed record UpdateExamStatusRequest(bool IsActive);

/// <summary>
/// Dipakai untuk membuat maupun mengubah soal. <c>Options</c> diabaikan untuk
/// soal uraian dan wajib berisi minimal 2 pilihan untuk soal pilihan ganda.
/// <c>AnswerKey</c> hanya dipakai soal uraian: jawaban acuan bagi admin saat
/// menilai manual, tidak pernah dikirim ke mahasiswa.
/// </summary>
public sealed record SaveQuestionRequest(
    string Type,
    string QuestionText,
    string? Image,
    string? AnswerKey,
    IReadOnlyList<SaveOptionRequest>? Options
);

public sealed record SaveOptionRequest(
    string OptionText,
    bool IsCorrect
);
