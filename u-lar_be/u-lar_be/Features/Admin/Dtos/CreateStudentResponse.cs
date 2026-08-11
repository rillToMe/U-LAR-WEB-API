namespace u_lar_be.Features.Admin.Dtos;

public sealed record CreateStudentResponse(
    int UserId,
    string Nim,
    string Name,
    string Email,
    string Role
);