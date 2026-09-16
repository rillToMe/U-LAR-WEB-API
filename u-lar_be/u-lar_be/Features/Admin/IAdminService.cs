using u_lar_be.Common;
using u_lar_be.Features.Admin.Dtos;

namespace u_lar_be.Features.Admin;

public interface IAdminService
{
    Task<CreateStudentResponse> CreateStudentAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken);

    Task<PagedResult<StudentListItemResponse>> GetStudentsAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<UpdateStudentResponse> UpdateStudentAsync(
        int studentId,
        UpdateStudentRequest request,
        CancellationToken cancellationToken);
    
    Task<AdminDashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken);
}