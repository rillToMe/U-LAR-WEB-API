using System.ComponentModel.DataAnnotations;

namespace u_lar_be.Configuration.Options;

/// <summary>
/// Tempat penyimpanan berkas unggahan admin (gambar diagram materi) dari
/// section "MediaStorage". Folder-nya relatif terhadap wwwroot supaya
/// berkasnya bisa disajikan middleware static file.
/// </summary>
public sealed class MediaStorageOptions
{
    public const string SectionName = "MediaStorage";

    /// <summary>Folder unggahan di dalam wwwroot.</summary>
    [Required]
    public string UploadFolder { get; init; } = "uploads/materials";

    /// <summary>Awalan alamat publik folder itu. Nilai inilah yang disimpan
    /// di kolom gambar materi, jadi bentuknya path relatif - bukan alamat
    /// lengkap - supaya tidak terikat host tempat admin mengunggah.</summary>
    [Required]
    public string RequestPath { get; init; } = "/uploads/materials";

    [Range(1, 20)]
    public int MaxFileSizeMb { get; init; } = 3;

    /// <summary>Batas ukuran berkas dalam byte (turunan MaxFileSizeMb).</summary>
    public long MaxFileSizeBytes => (long)MaxFileSizeMb * 1024 * 1024;
}
