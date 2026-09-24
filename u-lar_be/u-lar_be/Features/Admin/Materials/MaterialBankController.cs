using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Admin.Materials.Dtos;

namespace u_lar_be.Features.Admin.Materials;

/// <summary>
/// Bank Materi untuk admin. Route-nya "MaterialBank" (bukan "Material") supaya
/// tidak bertabrakan dengan endpoint materi yang dibaca mahasiswa.
/// </summary>
[Authorize(Roles = UserRoles.Admin)]
public sealed class MaterialBankController(
    IMaterialBankService materialBankService
) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MaterialSummaryResponse>>>
        GetMaterials(CancellationToken cancellationToken)
    {
        var materials = await materialBankService.GetMaterialsAsync(
            cancellationToken);

        return Ok(materials);
    }

    [HttpGet("{materialId:int}")]
    public async Task<ActionResult<MaterialDetailResponse>> GetMaterial(
        int materialId,
        CancellationToken cancellationToken)
    {
        var material = await materialBankService.GetMaterialAsync(
            materialId,
            cancellationToken);

        return Ok(material);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMaterial(
        SaveMaterialRequest request,
        CancellationToken cancellationToken)
    {
        var materialId = await materialBankService.CreateMaterialAsync(
            request,
            cancellationToken);

        return Ok(new
        {
            id = materialId,
            message = "Materi berhasil dibuat."
        });
    }

    [HttpPut("{materialId:int}")]
    public async Task<IActionResult> UpdateMaterial(
        int materialId,
        SaveMaterialRequest request,
        CancellationToken cancellationToken)
    {
        await materialBankService.UpdateMaterialAsync(
            materialId,
            request,
            cancellationToken);

        return Ok(new { message = "Materi berhasil diperbarui." });
    }

    [HttpPatch("{materialId:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int materialId,
        UpdateMaterialStatusRequest request,
        CancellationToken cancellationToken)
    {
        await materialBankService.UpdateStatusAsync(
            materialId,
            request.IsActive,
            cancellationToken);

        return Ok(new
        {
            message = request.IsActive
                ? "Materi berhasil diaktifkan."
                : "Materi berhasil dinonaktifkan."
        });
    }

    [HttpDelete("{materialId:int}")]
    public async Task<IActionResult> DeleteMaterial(
        int materialId,
        CancellationToken cancellationToken)
    {
        await materialBankService.DeleteMaterialAsync(
            materialId,
            cancellationToken);

        return Ok(new { message = "Materi berhasil dihapus." });
    }
}
