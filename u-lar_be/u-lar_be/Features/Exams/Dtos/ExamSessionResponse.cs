namespace u_lar_be.Features.Exams.Dtos;

/// <summary>
/// Isi satu sesi ujian yang siap dikerjakan: identitas ujian, sisa waktu versi
/// server, dan seluruh soal beserta jawaban yang sudah tersimpan (supaya sesi
/// bisa dilanjutkan setelah aplikasi ditutup).
/// </summary>
public sealed record ExamSessionResponse(
    int ResultId,
    int ExamId,
    string ExamTitle,
    int DurationMinutes,
    int PassingScore,
    int Attempt,
    int RemainingSeconds,
    int TotalQuestions,
    int AnsweredCount,
    IReadOnlyList<ExamSessionQuestionResponse> Questions
);

public sealed record ExamSessionQuestionResponse(
    int Id,
    int OrderNumber,
    string Type,
    string QuestionText,
    string? Image,
    IReadOnlyList<ExamSessionOptionResponse> Options,
    int? SelectedOptionId,
    string? AnswerText,
    bool IsFlagged
);

/// <summary>
/// Sengaja TANPA flag benar/salah — kunci jawaban tidak boleh sampai ke
/// perangkat mahasiswa selama ujian berjalan.
/// </summary>
public sealed record ExamSessionOptionResponse(
    int Id,
    string OptionText
);
