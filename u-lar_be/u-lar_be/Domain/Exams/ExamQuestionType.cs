namespace u_lar_be.Domain.Exams;

public enum ExamQuestionType
{
    /// <summary>Pilihan ganda — dinilai otomatis saat ujian dikumpulkan.</summary>
    MultipleChoice = 0,

    /// <summary>Uraian — disimpan apa adanya, dinilai manual oleh admin.</summary>
    Essay = 1
}

/// <summary>
/// Representasi string tipe soal pada kontrak API. Dipakai bersama oleh fitur
/// ujian mahasiswa dan fitur bank soal admin, jadi tempatnya di Domain —
/// bukan di salah satu slice Features.
/// </summary>
public static class ExamQuestionTypes
{
    public const string MultipleChoice = "multiple_choice";
    public const string Essay = "essay";

    public static string ToApi(ExamQuestionType type) =>
        type == ExamQuestionType.Essay ? Essay : MultipleChoice;

    /// <summary>Parsing longgar: nilai tak dikenal dianggap pilihan ganda.</summary>
    public static ExamQuestionType Parse(string? value) =>
        string.Equals(value, Essay, StringComparison.OrdinalIgnoreCase)
            ? ExamQuestionType.Essay
            : ExamQuestionType.MultipleChoice;
}
