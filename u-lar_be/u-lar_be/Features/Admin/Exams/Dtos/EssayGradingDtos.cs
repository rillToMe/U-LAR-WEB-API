namespace u_lar_be.Features.Admin.Exams.Dtos;

/// <summary>
/// Jawaban uraian satu ujian, dikelompokkan per mahasiswa supaya admin memilih
/// mahasiswa dulu, baru menilai soalnya satu per satu.
/// </summary>
public sealed record EssayGradingResponse(
    int ExamId,
    string ExamTitle,
    IReadOnlyList<EssayStudentGroup> Students
);

public sealed record EssayStudentGroup(
    int ResultId,
    string StudentName,
    string StudentNim,
    int Attempt,
    DateTime SubmittedAt,
    /// <summary>
    /// Seluruh soal uraian ujian ini, termasuk yang tidak dijawab mahasiswa
    /// (AnswerText null) — supaya dosen bisa melihat mana yang kosong.
    /// </summary>
    IReadOnlyList<EssayAnswerItem> Answers
);

public sealed record EssayAnswerItem(
    int QuestionId,
    int OrderNumber,
    string QuestionText,
    /// <summary>Kunci jawaban sebagai acuan penilaian, null kalau tidak diisi.</summary>
    string? AnswerKey,
    /// <summary>Null berarti soal ini tidak dijawab mahasiswa.</summary>
    string? AnswerText,
    /// <summary>Nilai 0-100 kalau sudah dinilai, null jika masih menunggu.</summary>
    int? Score
);

/// <summary>
/// Nilai per soal uraian, 0-100 per soal. Nilai akhir ujian dihitung ulang
/// oleh server setelah soal uraian dinilai.
/// </summary>
public sealed record GradeEssayRequest(
    int QuestionId,
    int Score
);

public sealed record GradeEssayBatchRequest(
    IReadOnlyList<GradeEssayRequest> Grades
);

public sealed record EssayGradingResultResponse(
    int ResultId,
    string StudentName,
    string StudentNim,
    int Score,
    bool Passed,
    string Message
);
