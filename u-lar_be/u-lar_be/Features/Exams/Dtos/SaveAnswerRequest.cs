namespace u_lar_be.Features.Exams.Dtos;

/// <summary>
/// Isi auto-save. Pilihan ganda mengirim <c>SelectedOptionId</c>, uraian
/// mengirim <c>AnswerText</c> — yang tidak relevan boleh dikirim null.
/// </summary>
public sealed record SaveAnswerRequest(
    int? SelectedOptionId,
    string? AnswerText
);
