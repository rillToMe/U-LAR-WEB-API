namespace u_lar_be.Features.Admin.Dtos;

public sealed record StudentListItemResponse(
    int Id,
    string Nim,
    string Name,
    string Email,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);