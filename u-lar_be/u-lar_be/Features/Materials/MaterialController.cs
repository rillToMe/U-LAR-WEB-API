using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Features.Materials.Dtos;

namespace u_lar_be.Features.Materials;

/// <summary>
/// Materi pembelajaran untuk halaman materi (WebView game).
///
/// Kontennya tidak sensitif dan dibuka langsung oleh WebView tanpa header
/// Authorization, jadi endpoint ini sengaja TANPA [Authorize] - token
/// mahasiswa tidak mungkin ditempelkan ke request yang dipicu WebView.
/// </summary>
public sealed class MaterialController(
    IMaterialService materialService
) : ApiControllerBase
{
    /// <summary>Daftar materi aktif, urut sesuai urutan yang diatur admin.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MaterialListItemResponse>>>
        GetMaterials(CancellationToken cancellationToken)
    {
        var materials = await materialService.GetMaterialsAsync(
            cancellationToken);

        return Ok(materials);
    }

    /// <summary>Isi lengkap satu materi berdasarkan slug.</summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<MaterialResponse>> GetMaterial(
        string slug,
        CancellationToken cancellationToken)
    {
        var material = await materialService.GetMaterialAsync(
            slug,
            cancellationToken);

        return Ok(material);
    }
}
