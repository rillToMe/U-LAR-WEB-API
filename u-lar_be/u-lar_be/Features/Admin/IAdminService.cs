using u_lar_be.Features.Admin.Dtos;

namespace u_lar_be.Features.Admin;

public interface IAdminService
{
    Task<CreateStudentResponse> CreateStudentAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<StudentListItemResponse>> GetStudentsAsync(
        CancellationToken cancellationToken);
}