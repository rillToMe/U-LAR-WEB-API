using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Domain.Exams;
using u_lar_be.Features.Exams.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Exams;

/// <summary>
/// Fitur ujian sisi mahasiswa.
///
/// Prinsip yang dipegang di sini:
/// 1. Waktu adalah milik server. Sisa waktu selalu dihitung dari
///    <c>exam_results.started_at</c> + <c>exams.duration_minutes</c>, tidak
///    pernah dari angka yang dikirim klien.
/// 2. Kunci jawaban tidak pernah keluar dari server selama ujian berjalan.
/// 3. Setiap penyimpanan jawaban melewati pemeriksaan kepemilikan sesi,
///    status ujian, dan sisa waktu.
/// </summary>
public sealed class ExamService(AppDbContext dbContext) : IExamService
{
    public async Task<IReadOnlyList<ExamListItemResponse>> GetExamsAsync(
        int studentId,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        // Sesi yang waktunya sudah habis tapi belum sempat dikumpulkan ditutup
        // di sini, supaya daftar ujian tidak menampilkan "berjalan" untuk
        // ujian yang sebenarnya sudah lewat.
        await SettleExpiredSessionsAsync(studentId, now, cancellationToken);

        // Ujian tanpa soal tidak ikut ditampilkan — tidak ada yang bisa
        // dikerjakan, dan menampilkannya cuma membingungkan mahasiswa.
        var exams = await dbContext.Exams
            .AsNoTracking()
            .Where(x => x.IsActive && x.Questions.Any())
            .OrderBy(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.Description,
                x.DurationMinutes,
                x.PassingScore,
                QuestionCount = x.Questions.Count
            })
            .ToListAsync(cancellationToken);

        var results = await dbContext.ExamResults
            .AsNoTracking()
            .Where(x => x.StudentId == studentId)
            .OrderBy(x => x.Attempt)
            .Select(x => new
            {
                x.Id,
                x.ExamId,
                x.Attempt,
                x.StartedAt,
                x.Score,
                x.Passed,
                x.FinishedAt
            })
            .ToListAsync(cancellationToken);

        return exams
            .Select(exam =>
            {
                var own = results
                    .Where(x => x.ExamId == exam.Id)
                    .ToList();

                var running = own.LastOrDefault(x => x.FinishedAt is null);
                var latest = own.LastOrDefault(x => x.FinishedAt is not null);

                if (running is not null)
                {
                    return new ExamListItemResponse(
                        exam.Id,
                        exam.Title,
                        exam.Description,
                        exam.DurationMinutes,
                        exam.PassingScore,
                        exam.QuestionCount,
                        ExamSessionStatuses.InProgress,
                        running.Id,
                        running.Attempt,
                        RemainingSeconds(
                            running.StartedAt,
                            exam.DurationMinutes,
                            now),
                        null,
                        null);
                }

                if (latest is not null)
                {
                    return new ExamListItemResponse(
                        exam.Id,
                        exam.Title,
                        exam.Description,
                        exam.DurationMinutes,
                        exam.PassingScore,
                        exam.QuestionCount,
                        ExamSessionStatuses.Finished,
                        latest.Id,
                        latest.Attempt,
                        null,
                        latest.Score,
                        latest.Passed);
                }

                return new ExamListItemResponse(
                    exam.Id,
                    exam.Title,
                    exam.Description,
                    exam.DurationMinutes,
                    exam.PassingScore,
                    exam.QuestionCount,
                    ExamSessionStatuses.NotStarted,
                    null,
                    null,
                    null,
                    null,
                    null);
            })
            .ToList();
    }

    public async Task<ExamSessionResponse> StartAsync(
        int studentId,
        int examId,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var exam = await LoadExamAsync(examId, cancellationToken);

        if (exam is null || !exam.IsActive)
        {
            throw new NotFoundException(
                "Ujian tidak ditemukan atau sudah tidak aktif.");
        }

        ValidateExamContent(exam);

        var running = await dbContext.ExamResults
            .Include(x => x.Answers)
            .Where(x => x.StudentId == studentId
                        && x.ExamId == examId
                        && x.FinishedAt == null)
            .OrderByDescending(x => x.Attempt)
            .FirstOrDefaultAsync(cancellationToken);

        if (running is not null)
        {
            if (!IsExpired(running.StartedAt, exam.DurationMinutes, now))
            {
                return BuildSession(running, exam, now);
            }

            // Sesi lama sudah kehabisan waktu: tutup dulu supaya jawabannya
            // tidak tercampur ke percobaan berikutnya.
            Grade(running, exam, now);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var lastAttempt = await dbContext.ExamResults
            .Where(x => x.StudentId == studentId && x.ExamId == examId)
            .Select(x => (int?)x.Attempt)
            .MaxAsync(cancellationToken) ?? 0;

        var created = new ExamResult
        {
            StudentId = studentId,
            ExamId = examId,
            Attempt = lastAttempt + 1,
            StartedAt = now
        };

        dbContext.ExamResults.Add(created);

        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildSession(created, exam, now);
    }

    public async Task<ExamSessionResponse> GetSessionAsync(
        int studentId,
        int resultId,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var result = await dbContext.ExamResults
            .Include(x => x.Answers)
            .FirstOrDefaultAsync(
                x => x.Id == resultId && x.StudentId == studentId,
                cancellationToken);

        if (result is null)
        {
            throw new NotFoundException("Sesi ujian tidak ditemukan.");
        }

        var exam = await LoadExamAsync(result.ExamId, cancellationToken)
                   ?? throw new NotFoundException("Ujian tidak ditemukan.");

        if (result.FinishedAt is not null)
        {
            throw new ConflictException("Ujian ini sudah dikumpulkan.");
        }

        if (IsExpired(result.StartedAt, exam.DurationMinutes, now))
        {
            Grade(result, exam, now);
            await dbContext.SaveChangesAsync(cancellationToken);

            throw new ConflictException(
                "Waktu ujian sudah habis, jawaban dikumpulkan otomatis.");
        }

        return BuildSession(result, exam, now);
    }

    public async Task<SaveAnswerResponse> SaveAnswerAsync(
        int studentId,
        int resultId,
        int questionId,
        SaveAnswerRequest request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var result = await dbContext.ExamResults
            .FirstOrDefaultAsync(
                x => x.Id == resultId && x.StudentId == studentId,
                cancellationToken);

        if (result is null)
        {
            throw new NotFoundException("Sesi ujian tidak ditemukan.");
        }

        var exam = await LoadExamAsync(result.ExamId, cancellationToken)
                   ?? throw new NotFoundException("Ujian tidak ditemukan.");

        if (result.FinishedAt is not null)
        {
            throw new ConflictException(
                "Ujian ini sudah dikumpulkan, jawaban tidak bisa diubah lagi.");
        }

        if (IsExpired(result.StartedAt, exam.DurationMinutes, now))
        {
            throw new ConflictException(
                "Waktu ujian sudah habis, jawaban tidak bisa disimpan lagi.");
        }

        var question = exam.Questions
            .FirstOrDefault(x => x.Id == questionId)
            ?? throw new NotFoundException(
                "Soal tidak ditemukan pada ujian ini.");

        var answer = await dbContext.ExamAnswers
            .FirstOrDefaultAsync(
                x => x.ResultId == resultId && x.QuestionId == questionId,
                cancellationToken);

        if (answer is null)
        {
            answer = new ExamAnswer
            {
                ResultId = resultId,
                QuestionId = questionId
            };

            dbContext.ExamAnswers.Add(answer);
        }

        if (question.Type == ExamQuestionType.Essay)
        {
            var text = request.AnswerText?.Trim();

            // Kosong berarti mahasiswa menghapus drafnya, bukan error.
            answer.AnswerText = string.IsNullOrEmpty(text) ? null : text;
            answer.SelectedOptionId = null;
        }
        else
        {
            if (request.SelectedOptionId is null)
            {
                throw new ValidationFailedException(
                    "Pilihan jawaban wajib diisi.");
            }

            var option = question.Options
                .FirstOrDefault(x => x.Id == request.SelectedOptionId)
                ?? throw new ValidationFailedException(
                    "Pilihan jawaban tidak termasuk soal ini.");

            answer.SelectedOptionId = option.Id;
            answer.AnswerText = null;
        }

        // Selama ujian berjalan belum ada penilaian sama sekali.
        answer.IsCorrect = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        var answeredCount = await dbContext.ExamAnswers
            .CountAsync(
                x => x.ResultId == resultId
                     && (x.SelectedOptionId != null || x.AnswerText != null),
                cancellationToken);

        return new SaveAnswerResponse(
            question.Id,
            answeredCount,
            exam.Questions.Count,
            RemainingSeconds(result, exam, now),
            answer.UpdatedAt);
    }

    public async Task<SaveQuestionFlagResponse> SetQuestionFlagAsync(
        int studentId,
        int resultId,
        int questionId,
        SaveQuestionFlagRequest request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var result = await dbContext.ExamResults
            .FirstOrDefaultAsync(
                x => x.Id == resultId && x.StudentId == studentId,
                cancellationToken);

        if (result is null)
        {
            throw new NotFoundException("Sesi ujian tidak ditemukan.");
        }

        var exam = await LoadExamAsync(result.ExamId, cancellationToken)
                   ?? throw new NotFoundException("Ujian tidak ditemukan.");

        if (result.FinishedAt is not null)
        {
            throw new ConflictException(
                "Ujian ini sudah dikumpulkan, tanda soal tidak bisa diubah lagi.");
        }

        if (IsExpired(result.StartedAt, exam.DurationMinutes, now))
        {
            throw new ConflictException(
                "Waktu ujian sudah habis, tanda soal tidak bisa diubah lagi.");
        }

        if (exam.Questions.All(x => x.Id != questionId))
        {
            throw new NotFoundException(
                "Soal tidak ditemukan pada ujian ini.");
        }

        var answer = await dbContext.ExamAnswers
            .FirstOrDefaultAsync(
                x => x.ResultId == resultId && x.QuestionId == questionId,
                cancellationToken);

        if (answer is null)
        {
            answer = new ExamAnswer
            {
                ResultId = resultId,
                QuestionId = questionId
            };

            dbContext.ExamAnswers.Add(answer);
        }

        answer.IsFlagged = request.Flagged;

        // Baris yang cuma berisi tanda (jawabannya belum diisi) tidak perlu
        // ikut tersimpan — biar tabel jawaban tetap berisi jawaban saja.
        if (!answer.IsFlagged
            && answer.SelectedOptionId is null
            && answer.AnswerText is null)
        {
            dbContext.ExamAnswers.Remove(answer);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var flaggedCount = await dbContext.ExamAnswers
            .CountAsync(
                x => x.ResultId == resultId && x.IsFlagged,
                cancellationToken);

        return new SaveQuestionFlagResponse(
            questionId,
            request.Flagged,
            flaggedCount);
    }

    public async Task<SubmitExamResponse> SubmitAsync(
        int studentId,
        int resultId,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var result = await dbContext.ExamResults
            .Include(x => x.Answers)
            .FirstOrDefaultAsync(
                x => x.Id == resultId && x.StudentId == studentId,
                cancellationToken);

        if (result is null)
        {
            throw new NotFoundException("Sesi ujian tidak ditemukan.");
        }

        var exam = await LoadExamAsync(result.ExamId, cancellationToken)
                   ?? throw new NotFoundException("Ujian tidak ditemukan.");

        // Idempotent: tombol yang terklik dua kali atau request ulang setelah
        // koneksi putus tetap mengembalikan hasil yang sama, bukan error.
        if (result.FinishedAt is not null)
        {
            return BuildSummary(result, exam);
        }

        Grade(result, exam, now);

        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildSummary(result, exam);
    }

    public async Task<SubmitExamResponse> GetSummaryAsync(
        int studentId,
        int resultId,
        CancellationToken cancellationToken)
    {
        var result = await dbContext.ExamResults
            .Include(x => x.Answers)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == resultId && x.StudentId == studentId,
                cancellationToken);

        if (result is null)
        {
            throw new NotFoundException("Sesi ujian tidak ditemukan.");
        }

        if (result.FinishedAt is null)
        {
            throw new ConflictException(
                "Ujian ini belum dikumpulkan, hasilnya belum tersedia.");
        }

        var exam = await LoadExamAsync(result.ExamId, cancellationToken)
                   ?? throw new NotFoundException("Ujian tidak ditemukan.");

        return BuildSummary(result, exam);
    }

    private async Task<Exam?> LoadExamAsync(
        int examId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Exams
            .Include(x => x.Questions)
                .ThenInclude(x => x.Options)
            .FirstOrDefaultAsync(x => x.Id == examId, cancellationToken);
    }

    /// <summary>
    /// Menutup sesi milik mahasiswa yang waktunya sudah lewat tapi belum
    /// dikumpulkan, supaya nilainya ikut terhitung dari jawaban yang tersimpan.
    /// </summary>
    private async Task SettleExpiredSessionsAsync(
        int studentId,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var running = await dbContext.ExamResults
            .Include(x => x.Answers)
            .Include(x => x.Exam)
                .ThenInclude(x => x.Questions)
                    .ThenInclude(x => x.Options)
            .Where(x => x.StudentId == studentId && x.FinishedAt == null)
            .ToListAsync(cancellationToken);

        var expired = running
            .Where(x => IsExpired(
                x.StartedAt,
                x.Exam.DurationMinutes,
                now))
            .ToList();

        if (expired.Count == 0)
        {
            return;
        }

        foreach (var result in expired)
        {
            Grade(result, result.Exam, now);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Menghitung nilai otomatis dari soal pilihan ganda. Soal uraian
    /// dinilai admin lewat endpoint penilaian; yang sudah punya nilai tetap
    /// dipertahankan dan ikut dihitung ulang setiap sesi ditutup. Soal yang
    /// tidak dijawab dihitung salah — tidak ada nilai minus.
    /// </summary>
    private static void Grade(
        ExamResult result,
        Exam exam,
        DateTime now)
    {
        var answersByQuestion = result.Answers
            .ToDictionary(x => x.QuestionId);

        var correctCount = 0;

        foreach (var question in exam.Questions)
        {
            if (!answersByQuestion.TryGetValue(question.Id, out var answer))
            {
                continue;
            }

            if (question.Type == ExamQuestionType.Essay)
            {
                // Uraian dinilai admin via endpoint penilaian; yang sudah
                // punya nilai tidak boleh ter-reset saat sesi lama ditutup.
                if (answer.Score is null)
                {
                    answer.IsCorrect = null;
                }

                continue;
            }

            var correctOptionId = question.Options
                .FirstOrDefault(x => x.IsCorrect)
                ?.Id;

            var isCorrect = answer.SelectedOptionId is not null
                            && answer.SelectedOptionId == correctOptionId;

            answer.IsCorrect = isCorrect;

            if (isCorrect)
            {
                correctCount++;
            }
        }

        var totalQuestions = exam.Questions.Count;

        var score = totalQuestions == 0
            ? 0
            : (int)Math.Round(
                correctCount * 100d / totalQuestions,
                MidpointRounding.AwayFromZero);

        var elapsed = (int)(now - result.StartedAt).TotalSeconds;
        var limit = exam.DurationMinutes * 60;

        result.Score = score;
        result.Passed = score >= exam.PassingScore;
        result.DurationSeconds = Math.Clamp(elapsed, 0, limit);

        // Sesi yang waktunya sudah lewat ditutup di batas waktunya, bukan di
        // waktu server kebetulan memeriksanya.
        result.FinishedAt = elapsed > limit
            ? result.StartedAt.AddSeconds(limit)
            : now;
    }

    private static ExamSessionResponse BuildSession(
        ExamResult result,
        Exam exam,
        DateTime now)
    {
        var answersByQuestion = result.Answers
            .ToDictionary(x => x.QuestionId);

        var questions = exam.Questions
            .OrderBy(x => x.OrderNumber)
            .ThenBy(x => x.Id)
            .Select(question =>
            {
                answersByQuestion.TryGetValue(question.Id, out var answer);

                var options = question.Options
                    .OrderBy(x => x.Id)
                    .Select(option => new ExamSessionOptionResponse(
                        option.Id,
                        option.OptionText))
                    .ToList();

                return new ExamSessionQuestionResponse(
                    question.Id,
                    question.OrderNumber,
                    ExamQuestionTypes.ToApi(question.Type),
                    question.QuestionText,
                    question.Image,
                    options,
                    answer?.SelectedOptionId,
                    answer?.AnswerText,
                    answer?.IsFlagged ?? false);
            })
            .ToList();

        return new ExamSessionResponse(
            result.Id,
            exam.Id,
            exam.Title,
            exam.DurationMinutes,
            exam.PassingScore,
            result.Attempt,
            RemainingSeconds(result, exam, now),
            questions.Count,
            CountAnswered(answersByQuestion.Values),
            questions);
    }

    private static SubmitExamResponse BuildSummary(
        ExamResult result,
        Exam exam)
    {
        var answersByQuestion = result.Answers
            .ToDictionary(x => x.QuestionId);

        var items = exam.Questions
            .OrderBy(x => x.OrderNumber)
            .ThenBy(x => x.Id)
            .Select(question =>
            {
                answersByQuestion.TryGetValue(question.Id, out var answer);

                return new SubmitExamItemResponse(
                    question.Id,
                    question.OrderNumber,
                    ExamQuestionTypes.ToApi(question.Type),
                    question.QuestionText,
                    IsAnswered(answer),
                    answer?.IsCorrect,
                    answer?.Score);
            })
            .ToList();

        // "Menunggu penilaian" = uraian yang terjawab tapi belum punya nilai
        // dari admin. Setelah admin menilai, kartu ini tidak lagi muncul.
        var pendingEssayCount = exam.Questions.Count(question =>
            question.Type == ExamQuestionType.Essay
            && answersByQuestion.TryGetValue(question.Id, out var answer)
            && IsAnswered(answer)
            && answer.Score is null);

        return new SubmitExamResponse(
            result.Id,
            exam.Id,
            exam.Title,
            result.Score,
            exam.PassingScore,
            result.Passed,
            items.Count(x => x.IsCorrect == true),
            items.Count(x => x.IsCorrect == false),
            items.Count(x => !x.Answered),
            items.Count,
            pendingEssayCount,
            result.DurationSeconds,
            result.StartedAt,
            result.FinishedAt ?? DateTime.UtcNow,
            items);
    }

    private static void ValidateExamContent(Exam exam)
    {
        if (exam.Questions.Count == 0)
        {
            throw new ValidationFailedException(
                "Ujian ini belum punya soal. Hubungi dosen atau admin.");
        }

        var brokenQuestion = exam.Questions.Any(question =>
            question.Type == ExamQuestionType.MultipleChoice
            && question.Options.Count == 0);

        if (brokenQuestion)
        {
            throw new ValidationFailedException(
                "Ada soal pilihan ganda yang belum punya pilihan jawaban.");
        }
    }

    /// <summary>Auto-save dipakai untuk kedua tipe soal, jadi "terjawab" harus
    /// mengecek opsi terpilih maupun teks uraian.</summary>
    private static bool IsAnswered(ExamAnswer? answer) =>
        answer is not null
        && (answer.SelectedOptionId is not null
            || !string.IsNullOrWhiteSpace(answer.AnswerText));

    private static int CountAnswered(IEnumerable<ExamAnswer> answers) =>
        answers.Count(IsAnswered);

    /// <summary>
    /// Sisa waktu yang boleh dipercaya klien. Dibulatkan ke atas supaya jam di
    /// layar tidak pernah mendahului server.
    /// </summary>
    private static int RemainingSeconds(
        ExamResult result,
        Exam exam,
        DateTime now) =>
        RemainingSeconds(result.StartedAt, exam.DurationMinutes, now);

    private static int RemainingSeconds(
        DateTime startedAt,
        int durationMinutes,
        DateTime now)
    {
        var remaining = durationMinutes * 60
                        - (now - startedAt).TotalSeconds;

        return remaining <= 0
            ? 0
            : (int)Math.Ceiling(remaining);
    }

    private static bool IsExpired(
        DateTime startedAt,
        int durationMinutes,
        DateTime now) =>
        now >= startedAt.AddMinutes(durationMinutes);
}
