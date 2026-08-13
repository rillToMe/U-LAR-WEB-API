using u_lar_be.Features.Admin.Students.DTOs;

namespace u_lar_be.Features.Admin.Students;

public interface IStudentService
{
    Task<StudentDetailResponse?> GetDetailAsync(
        int studentId,
        CancellationToken cancellationToken);

    Task<bool> ResetPasswordAsync(
        int studentId,
        string newPassword,
        CancellationToken cancellationToken);
    
    Task<bool> UpdateStatusAsync(
        int studentId,
        bool isActive,
        CancellationToken cancellationToken);
}