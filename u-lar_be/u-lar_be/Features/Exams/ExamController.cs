using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Exams.Dtos;

namespace u_lar_be.Features.Exams;

/// <summary>
/// Endpoint web ujian. Hanya bisa diakses mahasiswa yang login — id mahasiswa
/// selalu diambil dari token, tidak pernah dari request, supaya satu mahasiswa
/// tidak bisa menyentuh sesi ujian milik orang lain.
/// </summary>
[Authorize(Roles = UserRoles.Student)]
public sealed class ExamController(
    IExamService examService
) : ApiControllerBase
{
    /// <summary>Daftar ujian aktif beserta status pengerjaannya.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExamListItemResponse>>> GetExams(
        CancellationToken cancellationToken)
    {
        var exams = await examService.GetExamsAsync(
            CurrentUserId,
            cancellationToken);

        return Ok(exams);
    }

    /// <summary>
    /// Mulai ujian. Kalau masih ada sesi berjalan untuk ujian yang sama, sesi
    /// itulah yang dikembalikan berikut jawaban yang sudah tersimpan.
    /// </summary>
    [HttpPost("{examId:int}/start")]
    public async Task<ActionResult<ExamSessionResponse>> Start(
        int examId,
        CancellationToken cancellationToken)
    {
        var session = await examService.StartAsync(
            CurrentUserId,
            examId,
            cancellationToken);

        return Ok(session);
    }

    [HttpGet("sessions/{resultId:int}")]
    public async Task<ActionResult<ExamSessionResponse>> GetSession(
        int resultId,
        CancellationToken cancellationToken)
    {
        var session = await examService.GetSessionAsync(
            CurrentUserId,
            resultId,
            cancellationToken);

        return Ok(session);
    }

    /// <summary>
    /// Auto-save satu jawaban. Dipanggil setiap mahasiswa menekan pilihan,
    /// jadi balasannya sengaja ringan.
    /// </summary>
    [HttpPut("sessions/{resultId:int}/answers/{questionId:int}")]
    public async Task<ActionResult<SaveAnswerResponse>> SaveAnswer(
        int resultId,
        int questionId,
        SaveAnswerRequest request,
        CancellationToken cancellationToken)
    {
        var saved = await examService.SaveAnswerAsync(
            CurrentUserId,
            resultId,
            questionId,
            request,
            cancellationToken);

        return Ok(saved);
    }

    /// <summary>
    /// Menandai satu soal sebagai "ragu-ragu" (atau melepas tandanya). Soal
    /// yang ditandai belum tentu sudah dijawab, jadi endpoint-nya terpisah
    /// dari auto-save jawaban.
    /// </summary>
    [HttpPut("sessions/{resultId:int}/answers/{questionId:int}/flag")]
    public async Task<ActionResult<SaveQuestionFlagResponse>> SaveQuestionFlag(
        int resultId,
        int questionId,
        SaveQuestionFlagRequest request,
        CancellationToken cancellationToken)
    {
        var saved = await examService.SetQuestionFlagAsync(
            CurrentUserId,
            resultId,
            questionId,
            request,
            cancellationToken);

        return Ok(saved);
    }

    [HttpPost("sessions/{resultId:int}/submit")]
    public async Task<ActionResult<SubmitExamResponse>> Submit(
        int resultId,
        CancellationToken cancellationToken)
    {
        var summary = await examService.SubmitAsync(
            CurrentUserId,
            resultId,
            cancellationToken);

        return Ok(summary);
    }

    [HttpGet("sessions/{resultId:int}/summary")]
    public async Task<ActionResult<SubmitExamResponse>> GetSummary(
        int resultId,
        CancellationToken cancellationToken)
    {
        var summary = await examService.GetSummaryAsync(
            CurrentUserId,
            resultId,
            cancellationToken);

        return Ok(summary);
    }
}
