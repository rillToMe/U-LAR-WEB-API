using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Domain.Materials;
using u_lar_be.Features.Materials.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Materials;

/// <summary>
/// Materi yang dibaca mahasiswa. Hanya materi aktif yang pernah terlihat di
/// sini - materi yang dinonaktifkan admin langsung hilang dari daftar.
/// </summary>
public sealed class MaterialService(AppDbContext dbContext) : IMaterialService
{
    public async Task<IReadOnlyList<MaterialListItemResponse>> GetMaterialsAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Materials
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.OrderNumber)
            .ThenBy(x => x.Id)
            .Select(x => new MaterialListItemResponse(
                x.Slug,
                x.ModuleCode,
                x.Title,
                x.Subtitle,
                x.ReadMinutes))
            .ToListAsync(cancellationToken);
    }

    public async Task<MaterialResponse> GetMaterialAsync(
        string slug,
        CancellationToken cancellationToken)
    {
        var material = await dbContext.Materials
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Slug == slug && x.IsActive,
                cancellationToken)
            ?? throw new NotFoundException(
                $"Materi '{slug}' tidak ditemukan.");

        return ToResponse(material);
    }

    /// <summary>Blok isi milik entity (kolom JSON) diubah ke record response.</summary>
    private static MaterialResponse ToResponse(Material material) =>
        new(
            material.Slug,
            material.ModuleCode,
            material.Title,
            material.Subtitle,
            material.ReadMinutes,
            material.KeyPoints
                .Select(x => new MaterialKeyPointResponse(x.Icon, x.Text))
                .ToList(),
            material.Callouts
                .Select(x => new MaterialCalloutResponse(x.Tone, x.Label, x.Body))
                .ToList(),
            material.Diagrams
                .Select(x => new MaterialDiagramResponse(x.ImageUrl, x.Caption))
                .ToList(),
            material.Accordion
                .Select(x => new MaterialAccordionResponse(x.Title, x.Body))
                .ToList());
}
