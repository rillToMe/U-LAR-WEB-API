using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Admin.Exams.Dtos;

namespace u_lar_be.Features.Admin.Exams;

/// <summary>
/// Bank soal ujian untuk admin. Route-nya "ExamBank" (bukan "Exam") supaya
/// tidak bertabrakan dengan endpoint ujian milik mahasiswa.
/// </summary>
[Authorize(Roles = UserRoles.Admin)]
public sealed class ExamBankController(
    IExamBankService examBankService
) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExamSummaryResponse>>> GetExams(
        CancellationToken cancellationToken)
    {
        var exams = await examBankService.GetExamsAsync(cancellationToken);

        return Ok(exams);
    }

    [HttpGet("{examId:int}")]
    public async Task<ActionResult<ExamDetailResponse>> GetExam(
        int examId,
        CancellationToken cancellationToken)
    {
        var exam = await examBankService.GetExamAsync(
            examId,
            cancellationToken);

        return Ok(exam);
    }

    [HttpPost]
    public async Task<IActionResult> CreateExam(
        CreateExamRequest request,
        CancellationToken cancellationToken)
    {
        var examId = await examBankService.CreateExamAsync(
            request,
            cancellationToken);

        return Ok(new
        {
            id = examId,
            message = "Ujian berhasil dibuat. Lanjutkan dengan menambah soal."
        });
    }

    [HttpPut("{examId:int}")]
    public async Task<IActionResult> UpdateExam(
        int examId,
        UpdateExamRequest request,
        CancellationToken cancellationToken)
    {
        await examBankService.UpdateExamAsync(
            examId,
            request,
            cancellationToken);

        return Ok(new { message = "Ujian berhasil diperbarui." });
    }

    [HttpPatch("{examId:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int examId,
        UpdateExamStatusRequest request,
        CancellationToken cancellationToken)
    {
        await examBankService.UpdateStatusAsync(
            examId,
            request.IsActive,
            cancellationToken);

        return Ok(new
        {
            message = request.IsActive
                ? "Ujian berhasil diaktifkan."
                : "Ujian berhasil dinonaktifkan."
        });
    }

    [HttpDelete("{examId:int}")]
    public async Task<IActionResult> DeleteExam(
        int examId,
        CancellationToken cancellationToken)
    {
        await examBankService.DeleteExamAsync(examId, cancellationToken);

        return Ok(new { message = "Ujian berhasil dihapus." });
    }

    [HttpPost("{examId:int}/questions")]
    public async Task<IActionResult> CreateQuestion(
        int examId,
        SaveQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var questionId = await examBankService.CreateQuestionAsync(
            examId,
            request,
            cancellationToken);

        return Ok(new
        {
            id = questionId,
            message = "Soal berhasil ditambahkan."
        });
    }

    [HttpPut("questions/{questionId:int}")]
    public async Task<IActionResult> UpdateQuestion(
        int questionId,
        SaveQuestionRequest request,
        CancellationToken cancellationToken)
    {
        await examBankService.UpdateQuestionAsync(
            questionId,
            request,
            cancellationToken);

        return Ok(new { message = "Soal berhasil diperbarui." });
    }

    [HttpDelete("questions/{questionId:int}")]
    public async Task<IActionResult> DeleteQuestion(
        int questionId,
        CancellationToken cancellationToken)
    {
        await examBankService.DeleteQuestionAsync(
            questionId,
            cancellationToken);

        return Ok(new { message = "Soal berhasil dihapus." });
    }

    /// <summary>
    /// Jawaban uraian ujian ini dikelompokkan per mahasiswa, termasuk soal
    /// uraian yang tidak dijawab (AnswerText null). Nilai dikirim balik lewat
    /// endpoint grade.
    /// </summary>
    [HttpGet("{examId:int}/essay-grading")]
    public async Task<ActionResult<EssayGradingResponse>> GetEssayGrading(
        int examId,
        CancellationToken cancellationToken)
    {
        var grading = await examBankService.GetEssayGradingAsync(
            examId,
            cancellationToken);

        return Ok(grading);
    }

    /// <summary>
    /// Menyimpan nilai per soal uraian untuk satu percobaan ujian, lalu nilai
    /// akhir mahasiswa dihitung ulang oleh server.
    /// </summary>
    [HttpPost("results/{resultId:int}/essay-grading")]
    public async Task<ActionResult<EssayGradingResultResponse>> GradeEssays(
        int resultId,
        GradeEssayBatchRequest request,
        CancellationToken cancellationToken)
    {
        var result = await examBankService.GradeEssaysAsync(
            resultId,
            request,
            cancellationToken);

        return Ok(result);
    }
}
