namespace u_lar_be.Features.Admin.Students.DTOs;

public sealed class ResetStudentPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}