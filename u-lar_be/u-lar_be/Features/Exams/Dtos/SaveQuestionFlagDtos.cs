namespace u_lar_be.Features.Exams.Dtos;

/// <summary>
/// Isi penanda "ragu-ragu". Nilai akhirnya yang dikirim (bukan perintah
/// toggle), supaya permintaan yang datang terlambat tidak membalik keadaan
/// yang sudah benar.
/// </summary>
public sealed record SaveQuestionFlagRequest(bool Flagged);

/// <summary>
/// Balasan penanda "ragu-ragu". <c>FlaggedCount</c> ikut dikirim supaya
/// ringkasan di layar tidak perlu menghitung ulang dari data lama.
/// </summary>
public sealed record SaveQuestionFlagResponse(
    int QuestionId,
    bool Flagged,
    int FlaggedCount
);
