namespace u_lar_be.Features.Admin.Dtos;

public sealed record UpdateStudentRequest(
    string Nim,
    string Name,
    string Email
);
