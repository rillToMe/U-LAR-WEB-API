using u_lar_be.Features.Admin.Admins.DTOs;

namespace u_lar_be.Features.Admin.Admins;

public interface IAdminUserService
{
    Task<IReadOnlyList<AdminListItemResponse>> GetAllAsync(
        CancellationToken cancellationToken);

    Task<AdminListItemResponse> CreateAsync(
        CreateAdminRequest request,
        CancellationToken cancellationToken);

    Task<AdminListItemResponse> UpdateAsync(
        int adminId,
        UpdateAdminRequest request,
        int requestingAdminId,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        int adminId,
        int requestingAdminId,
        CancellationToken cancellationToken);
}
