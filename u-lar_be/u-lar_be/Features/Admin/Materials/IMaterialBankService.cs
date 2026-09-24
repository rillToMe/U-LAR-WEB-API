using u_lar_be.Features.Admin.Materials.Dtos;

namespace u_lar_be.Features.Admin.Materials;

/// <summary>
/// Bank Materi dari web admin: membuat, menyunting, mengaktifkan, dan
/// menghapus materi yang nanti dibaca mahasiswa di halaman materi.
/// </summary>
public interface IMaterialBankService
{
    Task<IReadOnlyList<MaterialSummaryResponse>> GetMaterialsAsync(
        CancellationToken cancellationToken);

    Task<MaterialDetailResponse> GetMaterialAsync(
        int materialId,
        CancellationToken cancellationToken);

    Task<int> CreateMaterialAsync(
        SaveMaterialRequest request,
        CancellationToken cancellationToken);

    Task UpdateMaterialAsync(
        int materialId,
        SaveMaterialRequest request,
        CancellationToken cancellationToken);

    Task UpdateStatusAsync(
        int materialId,
        bool isActive,
        CancellationToken cancellationToken);

    Task DeleteMaterialAsync(
        int materialId,
        CancellationToken cancellationToken);
}
