namespace u_lar_be.Features.Admin.Dtos;

public sealed record CreateStudentRequest(
    string Nim,
    string Name,
    string Email,
    string Password
);