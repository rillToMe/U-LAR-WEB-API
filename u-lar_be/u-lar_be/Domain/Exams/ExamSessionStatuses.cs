namespace u_lar_be.Domain.Exams;

/// <summary>
/// Status ujian dari sudut pandang seorang mahasiswa. Berbeda dengan
/// <see cref="ExamResult"/> yang hanya tahu "sudah selesai atau belum",
/// status ini juga membedakan "belum pernah dikerjakan".
/// </summary>
public static class ExamSessionStatuses
{
    public const string NotStarted = "not_started";
    public const string InProgress = "in_progress";
    public const string Finished = "finished";
}
