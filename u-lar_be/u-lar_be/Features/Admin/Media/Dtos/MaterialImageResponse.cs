namespace u_lar_be.Features.Admin.Media.Dtos;

/// <summary>
/// Hasil unggahan gambar diagram. <c>Url</c> berbentuk path relatif
/// (mis. "/uploads/materials/xxx.png"): halaman materi menggabungkannya
/// sendiri dengan alamat API yang sedang dipakai, jadi gambar tetap terbuka
/// baik lewat localhost maupun IP LAN game.
/// </summary>
public sealed record MaterialImageResponse(
    string Url,
    string FileName,
    long SizeBytes);
