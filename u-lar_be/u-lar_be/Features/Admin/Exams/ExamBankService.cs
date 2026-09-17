using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Domain.Exams;
using u_lar_be.Features.Admin.Exams.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Admin.Exams;

/// <summary>
/// Bank soal ujian. Semua aturan isi soal divalidasi di sini, bukan di
/// controller, supaya ujian yang tayang ke mahasiswa dijamin bisa dikerjakan
/// (mis. tidak ada soal pilihan ganda tanpa pilihan jawaban).
/// </summary>
public sealed class ExamBankService(AppDbContext dbContext) : IExamBankService
{
    /// <summary>Batas jumlah pilihan per soal supaya tampilan di HP tetap rapi.</summary>
    private const int MaxOptionsPerQuestion = 10;

    private const int MaxTitleLength = 150;
    private const int MaxDescriptionLength = 500;
    private const int MaxQuestionLength = 1000;
    private const int MaxAnswerKeyLength = 2000;
    private const int MaxOptionLength = 500;
    private const int MaxImageLength = 300;
    private const int MinDurationMinutes = 1;
    private const int MaxDurationMinutes = 600;

    public async Task<IReadOnlyList<ExamSummaryResponse>> GetExamsAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Exams
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .Select(x => new ExamSummaryResponse(
                x.Id,
                x.Title,
                x.Description,
                x.PassingScore,
                x.DurationMinutes,
                x.IsActive,
                x.Questions.Count,
                x.Results.Select(result => result.StudentId).Distinct().Count(),
                x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<ExamDetailResponse> GetExamAsync(
        int examId,
        CancellationToken cancellationToken)
    {
        var exam = await dbContext.Exams
            .AsNoTracking()
            .Include(x => x.Questions)
                .ThenInclude(x => x.Options)
            .FirstOrDefaultAsync(x => x.Id == examId, cancellationToken)
            ?? throw new NotFoundException(
                $"Ujian dengan id {examId} tidak ditemukan.");

        var studentCount = await dbContext.ExamResults
            .Where(x => x.ExamId == examId)
            .Select(x => x.StudentId)
            .Distinct()
            .CountAsync(cancellationToken);

        var questions = exam.Questions
            .OrderBy(x => x.OrderNumber)
            .ThenBy(x => x.Id)
            .Select(question => new ExamQuestionResponse(
                question.Id,
                question.OrderNumber,
                ExamQuestionTypes.ToApi(question.Type),
                question.QuestionText,
                question.Image,
                question.AnswerKey,
                question.Options
                    .OrderBy(x => x.Id)
                    .Select(option => new ExamOptionResponse(
                        option.Id,
                        option.OptionText,
                        option.IsCorrect))
                    .ToList()))
            .ToList();

        return new ExamDetailResponse(
            exam.Id,
            exam.Title,
            exam.Description,
            exam.PassingScore,
            exam.DurationMinutes,
            exam.IsActive,
            studentCount,
            questions);
    }

    public async Task<int> CreateExamAsync(
        CreateExamRequest request,
        CancellationToken cancellationToken)
    {
        var exam = new Exam
        {
            Title = ValidateTitle(request.Title),
            Description = NormalizeText(
                request.Description,
                MaxDescriptionLength,
                "Deskripsi"),
            PassingScore = ValidatePassingScore(request.PassingScore),
            DurationMinutes = ValidateDuration(request.DurationMinutes)
        };

        dbContext.Exams.Add(exam);

        await dbContext.SaveChangesAsync(cancellationToken);

        return exam.Id;
    }

    public async Task UpdateExamAsync(
        int examId,
        UpdateExamRequest request,
        CancellationToken cancellationToken)
    {
        var exam = await FindExamAsync(examId, cancellationToken);

        exam.Title = ValidateTitle(request.Title);
        exam.Description = NormalizeText(
            request.Description,
            MaxDescriptionLength,
            "Deskripsi");
        exam.PassingScore = ValidatePassingScore(request.PassingScore);
        exam.DurationMinutes = ValidateDuration(request.DurationMinutes);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateStatusAsync(
        int examId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var exam = await FindExamAsync(examId, cancellationToken);

        // Ujian tanpa soal tidak boleh diaktifkan — mahasiswa akan mentok di
        // halaman mulai ujian.
        if (isActive)
        {
            var questionCount = await dbContext.ExamQuestions
                .CountAsync(x => x.ExamId == examId, cancellationToken);

            if (questionCount == 0)
            {
                throw new ValidationFailedException(
                    "Ujian belum punya satu pun soal, jadi belum bisa diaktifkan.");
            }
        }

        exam.IsActive = isActive;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteExamAsync(
        int examId,
        CancellationToken cancellationToken)
    {
        var exam = await FindExamAsync(examId, cancellationToken);

        var hasResult = await dbContext.ExamResults
            .AnyAsync(x => x.ExamId == examId, cancellationToken);

        if (hasResult)
        {
            throw new ConflictException(
                "Ujian ini sudah punya riwayat pengerjaan mahasiswa, jadi tidak " +
                "bisa dihapus. Nonaktifkan saja supaya tidak muncul lagi.");
        }

        dbContext.Exams.Remove(exam);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> CreateQuestionAsync(
        int examId,
        SaveQuestionRequest request,
        CancellationToken cancellationToken)
    {
        await FindExamAsync(examId, cancellationToken);

        var lastOrderNumber = await dbContext.ExamQuestions
            .Where(x => x.ExamId == examId)
            .Select(x => (int?)x.OrderNumber)
            .MaxAsync(cancellationToken) ?? 0;

        var type = ExamQuestionTypes.Parse(request.Type);

        var question = new ExamQuestion
        {
            ExamId = examId,
            Type = type,
            QuestionText = ValidateQuestionText(request.QuestionText),
            Image = NormalizeText(request.Image, MaxImageLength, "Gambar"),
            AnswerKey = NormalizeAnswerKey(type, request.AnswerKey),
            OrderNumber = lastOrderNumber + 1
        };

        ApplyOptions(question, request.Options);

        dbContext.ExamQuestions.Add(question);

        await dbContext.SaveChangesAsync(cancellationToken);

        return question.Id;
    }

    public async Task UpdateQuestionAsync(
        int questionId,
        SaveQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var question = await dbContext.ExamQuestions
            .Include(x => x.Options)
            .FirstOrDefaultAsync(x => x.Id == questionId, cancellationToken)
            ?? throw new NotFoundException(
                $"Soal dengan id {questionId} tidak ditemukan.");

        question.Type = ExamQuestionTypes.Parse(request.Type);
        question.QuestionText = ValidateQuestionText(request.QuestionText);
        question.Image = NormalizeText(request.Image, MaxImageLength, "Gambar");
        question.AnswerKey = NormalizeAnswerKey(
            question.Type,
            request.AnswerKey);

        ApplyOptions(question, request.Options);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteQuestionAsync(
        int questionId,
        CancellationToken cancellationToken)
    {
        var question = await dbContext.ExamQuestions
            .FirstOrDefaultAsync(x => x.Id == questionId, cancellationToken)
            ?? throw new NotFoundException(
                $"Soal dengan id {questionId} tidak ditemukan.");

        // Pilihan jawaban dan jawaban mahasiswa untuk soal ini ikut terhapus
        // lewat aturan cascade di database.
        dbContext.ExamQuestions.Remove(question);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Menyiapkan daftar mahasiswa yang mengumpulkan ujian ini beserta
    /// seluruh soal uraiannya. Soal yang tidak dijawab ikut dikirim dengan
    /// AnswerText null supaya dosen melihat mana yang kosong.
    /// </summary>
    public async Task<EssayGradingResponse> GetEssayGradingAsync(
        int examId,
        CancellationToken cancellationToken)
    {
        var exam = await FindExamWithQuestionsAsync(examId, cancellationToken);

        // Seluruh soal uraian ujian ini — termasuk yang nanti ternyata tidak
        // dijawab mahasiswa, supaya dosen melihat soal kosongnya.
        var essayQuestions = exam.Questions
            .Where(x => x.Type == ExamQuestionType.Essay)
            .OrderBy(x => x.OrderNumber)
            .ThenBy(x => x.Id)
            .ToList();

        if (essayQuestions.Count == 0)
        {
            return new EssayGradingResponse(exam.Id, exam.Title, []);
        }

        var results = await dbContext.ExamResults
            .AsNoTracking()
            .Include(x => x.Student)
            .Include(x => x.Answers)
            .Where(x => x.ExamId == examId && x.FinishedAt != null)
            .OrderBy(x => x.Student.Name)
            .ThenBy(x => x.Attempt)
            .ToListAsync(cancellationToken);

        var students = results
            .Select(result =>
            {
                var answersByQuestion = result.Answers
                    .ToDictionary(x => x.QuestionId);

                return new EssayStudentGroup(
                    result.Id,
                    result.Student.Name,
                    result.Student.Nim,
                    result.Attempt,
                    result.FinishedAt ?? result.StartedAt,
                    essayQuestions
                        .Select(question =>
                        {
                            answersByQuestion.TryGetValue(
                                question.Id,
                                out var answer);

                            var text = answer?.AnswerText;

                            return new EssayAnswerItem(
                                question.Id,
                                question.OrderNumber,
                                question.QuestionText,
                                question.AnswerKey,
                                string.IsNullOrWhiteSpace(text)
                                    ? null
                                    : text,
                                answer?.Score);
                        })
                        .ToList());
            })
            .ToList();

        return new EssayGradingResponse(exam.Id, exam.Title, students);
    }

    public async Task<EssayGradingResultResponse> GradeEssaysAsync(
        int resultId,
        GradeEssayBatchRequest request,
        CancellationToken cancellationToken)
    {
        var result = await dbContext.ExamResults
            .Include(x => x.Student)
            .Include(x => x.Exam)
                .ThenInclude(x => x.Questions)
            .Include(x => x.Answers)
            .FirstOrDefaultAsync(x => x.Id == resultId, cancellationToken)
            ?? throw new NotFoundException(
                $"Hasil ujian dengan id {resultId} tidak ditemukan.");

        if (result.FinishedAt is null)
        {
            throw new ConflictException(
                "Ujian ini belum dikumpulkan mahasiswanya, jadi belum bisa dinilai.");
        }

        if (request.Grades.Count == 0)
        {
            throw new ValidationFailedException(
                "Tidak ada nilai yang dikirim.");
        }

        var answersByQuestion = result.Answers
            .ToDictionary(x => x.QuestionId);

        foreach (var grade in request.Grades)
        {
            var question = result.Exam.Questions
                .FirstOrDefault(x => x.Id == grade.QuestionId);

            if (question is null
                || question.Type != ExamQuestionType.Essay)
            {
                throw new ValidationFailedException(
                    $"Soal {grade.QuestionId} bukan soal uraian pada ujian ini.");
            }

            if (grade.Score is < 0 or > 100)
            {
                throw new ValidationFailedException(
                    "Nilai soal uraian harus antara 0 sampai 100.");
            }

            if (!answersByQuestion.TryGetValue(
                    grade.QuestionId,
                    out var answer))
            {
                throw new ValidationFailedException(
                    "Mahasiswa tidak menjawab soal ini, jadi tidak bisa dinilai.");
            }

            answer.Score = grade.Score;
            answer.IsCorrect = grade.Score > 0;
        }

        RecalculateScore(result);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new EssayGradingResultResponse(
            result.Id,
            result.Student.Name,
            result.Student.Nim,
            result.Score,
            result.Passed,
            "Nilai uraian berhasil disimpan dan nilai akhir diperbarui.");
    }

    /// <summary>
    /// Menghitung ulang nilai akhir dengan rumus yang sama dengan penilaian
    /// otomatis: setiap soal berbobot sama (rata-rata 0-100 per soal), soal
    /// tidak dijawab bernilai 0. Pilihan ganda dinilai kunci jawaban, uraian
    /// dinilai dari <c>ExamAnswer.Score</c> yang diisi admin; uraian yang
    /// belum dinilai sementara bernilai 0 sehingga nilai akhir bisa naik
    /// lagi setelah admin menilai.
    /// </summary>
    private void RecalculateScore(ExamResult result)
    {
        var answersByQuestion = result.Answers
            .ToDictionary(x => x.QuestionId);

        var totalQuestions = result.Exam.Questions.Count;

        if (totalQuestions == 0)
        {
            result.Score = 0;
            result.Passed = result.Exam.PassingScore <= 0;
            return;
        }

        var totalScore = 0;

        foreach (var question in result.Exam.Questions)
        {
            if (!answersByQuestion.TryGetValue(
                    question.Id,
                    out var answer))
            {
                continue;
            }

            if (question.Type == ExamQuestionType.Essay)
            {
                totalScore += answer.Score ?? 0;
                continue;
            }

            var correctOptionId = question.Options
                .FirstOrDefault(x => x.IsCorrect)
                ?.Id;

            if (answer.SelectedOptionId is not null
                && answer.SelectedOptionId == correctOptionId)
            {
                totalScore += 100;
            }
        }

        result.Score = (int)Math.Round(
            totalScore * 1d / totalQuestions,
            MidpointRounding.AwayFromZero);

        result.Passed = result.Score >= result.Exam.PassingScore;
    }

    /// <summary>
    /// Menyusun pilihan jawaban soal. Untuk soal yang sudah ada, baris lama
    /// diperbarui di tempat dan hanya kelebihannya yang dihapus — supaya id
    /// pilihan yang mungkin masih dirujuk jawaban mahasiswa tidak ikut hilang.
    /// </summary>

    /// <summary>
    /// Menyusun pilihan jawaban soal. Untuk soal yang sudah ada, baris lama
    /// diperbarui di tempat dan hanya kelebihannya yang dihapus — supaya id
    /// pilihan yang mungkin masih dirujuk jawaban mahasiswa.TryGetValue(
    /// pilihan yang mungkin masih dirujuk jawaban mahasiswa tidak ikut hilang.
    /// </summary>
    private void ApplyOptions(
        ExamQuestion question,
        IReadOnlyList<SaveOptionRequest>? options)
    {
        var existing = question.Options
            .OrderBy(x => x.Id)
            .ToList();

        if (question.Type == ExamQuestionType.Essay)
        {
            if (existing.Count > 0)
            {
                dbContext.ExamOptions.RemoveRange(existing);
            }

            return;
        }

        var incoming = (options ?? [])
            .Select(x => new
            {
                Text = x.OptionText?.Trim() ?? string.Empty,
                x.IsCorrect
            })
            .ToList();

        if (incoming.Count < 2)
        {
            throw new ValidationFailedException(
                "Soal pilihan ganda minimal punya 2 pilihan jawaban.");
        }

        if (incoming.Count > MaxOptionsPerQuestion)
        {
            throw new ValidationFailedException(
                $"Satu soal maksimal {MaxOptionsPerQuestion} pilihan jawaban.");
        }

        if (incoming.Any(x => x.Text.Length == 0))
        {
            throw new ValidationFailedException(
                "Teks pilihan jawaban tidak boleh kosong.");
        }

        if (incoming.Any(x => x.Text.Length > MaxOptionLength))
        {
            throw new ValidationFailedException(
                $"Teks pilihan jawaban maksimal {MaxOptionLength} karakter.");
        }

        if (incoming.Count(x => x.IsCorrect) != 1)
        {
            throw new ValidationFailedException(
                "Tandai tepat satu pilihan jawaban sebagai jawaban benar.");
        }

        for (var index = 0; index < incoming.Count; index++)
        {
            var source = incoming[index];

            if (index < existing.Count)
            {
                existing[index].OptionText = source.Text;
                existing[index].IsCorrect = source.IsCorrect;
                continue;
            }

            question.Options.Add(new ExamOption
            {
                OptionText = source.Text,
                IsCorrect = source.IsCorrect
            });
        }

        if (existing.Count > incoming.Count)
        {
            dbContext.ExamOptions.RemoveRange(
                existing.Skip(incoming.Count));
        }
    }

    private async Task<Exam> FindExamAsync(
        int examId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Exams
            .FirstOrDefaultAsync(x => x.Id == examId, cancellationToken)
            ?? throw new NotFoundException(
                $"Ujian dengan id {examId} tidak ditemukan.");
    }

    private async Task<Exam> FindExamWithQuestionsAsync(
        int examId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Exams
            .Include(x => x.Questions)
            .FirstOrDefaultAsync(x => x.Id == examId, cancellationToken)
            ?? throw new NotFoundException(
                $"Ujian dengan id {examId} tidak ditemukan.");
    }

    private static string ValidateTitle(string? title)
    {
        var value = title?.Trim() ?? string.Empty;

        if (value.Length == 0)
        {
            throw new ValidationFailedException(
                "Judul ujian wajib diisi.");
        }

        if (value.Length > MaxTitleLength)
        {
            throw new ValidationFailedException(
                $"Judul ujian maksimal {MaxTitleLength} karakter.");
        }

        return value;
    }

    private static string ValidateQuestionText(string? text)
    {
        var value = text?.Trim() ?? string.Empty;

        if (value.Length == 0)
        {
            throw new ValidationFailedException(
                "Teks soal wajib diisi.");
        }

        if (value.Length > MaxQuestionLength)
        {
            throw new ValidationFailedException(
                $"Teks soal maksimal {MaxQuestionLength} karakter.");
        }

        return value;
    }

    private static int ValidatePassingScore(int passingScore)
    {
        if (passingScore is < 0 or > 100)
        {
            throw new ValidationFailedException(
                "Nilai minimal kelulusan harus antara 0 sampai 100.");
        }

        return passingScore;
    }

    private static int ValidateDuration(int durationMinutes)
    {
        if (durationMinutes is < MinDurationMinutes or > MaxDurationMinutes)
        {
            throw new ValidationFailedException(
                $"Durasi ujian harus antara {MinDurationMinutes} " +
                $"sampai {MaxDurationMinutes} menit.");
        }

        return durationMinutes;
    }

    /// <summary>
    /// Kunci jawaban hanya berlaku untuk soal uraian. Soal pilihan ganda
    /// jawabannya sudah ada di kunci pilihannya, jadi nilainya dibuang.
    /// </summary>
    private static string? NormalizeAnswerKey(
        ExamQuestionType type,
        string? answerKey)
    {
        if (type != ExamQuestionType.Essay)
        {
            return null;
        }

        return NormalizeText(
            answerKey,
            MaxAnswerKeyLength,
            "Kunci jawaban");
    }

    private static string? NormalizeText(
        string? text,
        int maxLength,
        string fieldName)
    {
        var value = text?.Trim();

        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        if (value.Length > maxLength)
        {
            throw new ValidationFailedException(
                $"{fieldName} maksimal {maxLength} karakter.");
        }

        return value;
    }
}
