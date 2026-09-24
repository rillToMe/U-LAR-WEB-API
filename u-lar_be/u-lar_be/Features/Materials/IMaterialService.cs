using u_lar_be.Features.Materials.Dtos;

namespace u_lar_be.Features.Materials;

/// <summary>
/// Sisi mahasiswa dari Bank Materi: daftar materi aktif dan isi satu materi.
/// Materi diisi admin lewat <c>Features/Admin/Materials</c>.
/// </summary>
public interface IMaterialService
{
    Task<IReadOnlyList<MaterialListItemResponse>> GetMaterialsAsync(
        CancellationToken cancellationToken);

    /// <summary>Isi lengkap satu materi berdasarkan slug. Lempar
    /// <c>NotFoundException</c> kalau slug tidak dikenal / materi nonaktif.</summary>
    Task<MaterialResponse> GetMaterialAsync(
        string slug,
        CancellationToken cancellationToken);
}
