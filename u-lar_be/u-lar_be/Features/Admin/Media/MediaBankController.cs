using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Admin.Media.Dtos;

namespace u_lar_be.Features.Admin.Media;

/// <summary>
/// Unggahan berkas dari web admin. Route-nya "MediaBank", sejajar dengan
/// "MaterialBank" dan "ExamBank" supaya jelas ini sisi admin.
/// </summary>
[Authorize(Roles = UserRoles.Admin)]
public sealed class MediaBankController(
    IMediaService mediaService
) : ApiControllerBase
{
    /// <summary>
    /// Gambar diagram materi. Dikirim sebagai multipart/form-data dengan nama
    /// field "file" supaya cocok dengan blok diagram di editor materi.
    /// </summary>
    [HttpPost("materials/images")]
    public async Task<ActionResult<MaterialImageResponse>> UploadMaterialImage(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var response = await mediaService.UploadMaterialImageAsync(
            file,
            cancellationToken);

        return Ok(response);
    }
}
