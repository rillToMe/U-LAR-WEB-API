using Microsoft.Extensions.Options;
using u_lar_be.Common.Exceptions;
using u_lar_be.Configuration.Options;
using u_lar_be.Features.Admin.Media.Dtos;

namespace u_lar_be.Features.Admin.Media;

/// <summary>
/// Menyimpan berkas unggahan admin ke wwwroot supaya bisa disajikan
/// middleware static file. Nama berkas selalu dibuat baru (GUID) - nama
/// kiriman klien tidak pernah dipakai sebagai path.
/// </summary>
public sealed class MediaService(
    IWebHostEnvironment environment,
    IOptions<MediaStorageOptions> options) : IMediaService
{
    /// <summary>Jenis gambar yang boleh diunggah beserta ekstensi simpannya.</summary>
    private static readonly Dictionary<string, string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/png"] = ".png",
            ["image/jpeg"] = ".jpg",
            ["image/webp"] = ".webp"
        };

    /// <summary>Folder wwwroot. Dihitung sendiri supaya instalasi baru tanpa
    /// folder wwwroot tetap bisa menerima unggahan pertama.</summary>
    private string WebRoot =>
        environment.WebRootPath
        ?? Path.Combine(environment.ContentRootPath, "wwwroot");

    public async Task<MaterialImageResponse> UploadMaterialImageAsync(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var media = options.Value;

        if (file.Length == 0)
        {
            throw new ValidationFailedException("Berkas gambar kosong.");
        }

        if (file.Length > media.MaxFileSizeBytes)
        {
            throw new ValidationFailedException(
                $"Ukuran gambar maksimal {media.MaxFileSizeMb} MB.");
        }

        if (!AllowedContentTypes.TryGetValue(
                file.ContentType,
                out var extension))
        {
            throw new ValidationFailedException(
                "Format gambar harus PNG, JPG, atau WEBP.");
        }

        // Tipe MIME kiriman klien bisa saja hanya nama. Isi berkasnya ikut
        // diperiksa supaya yang tersimpan benar-benar gambar.
        if (!await HasImageSignatureAsync(file, cancellationToken))
        {
            throw new ValidationFailedException(
                "Isi berkas bukan gambar yang sah.");
        }

        var folder = Path.Combine(WebRoot, media.UploadFolder);

        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(folder, fileName);

        await using (var stream = new FileStream(path, FileMode.CreateNew))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var url = $"{media.RequestPath.TrimEnd('/')}/{fileName}";

        return new MaterialImageResponse(url, fileName, file.Length);
    }

    /// <summary>Tanda awal berkas gambar: PNG (89 50 4E 47), JPEG (FF D8 FF),
    /// atau WEBP (RIFF....WEBP).</summary>
    private static async Task<bool> HasImageSignatureAsync(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var header = new byte[12];

        await using var stream = file.OpenReadStream();

        var read = await stream.ReadAtLeastAsync(
            header,
            header.Length,
            throwOnEndOfStream: false,
            cancellationToken);

        if (read < 4)
        {
            return false;
        }

        if (header[0] == 0x89 && header[1] == 0x50
            && header[2] == 0x4E && header[3] == 0x47)
        {
            return true;
        }

        if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            return true;
        }

        return read >= header.Length
               && header[0] == 'R' && header[1] == 'I'
               && header[2] == 'F' && header[3] == 'F'
               && header[8] == 'W' && header[9] == 'E'
               && header[10] == 'B' && header[11] == 'P';
    }
}
