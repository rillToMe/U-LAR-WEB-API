using u_lar_be.Features.Admin.Media.Dtos;

namespace u_lar_be.Features.Admin.Media;

/// <summary>
/// Berkas yang diunggah admin dari web admin. Saat ini hanya gambar diagram
/// materi - dipakai blok diagram di editor materi.
/// </summary>
public interface IMediaService
{
    Task<MaterialImageResponse> UploadMaterialImageAsync(
        IFormFile file,
        CancellationToken cancellationToken);
}
