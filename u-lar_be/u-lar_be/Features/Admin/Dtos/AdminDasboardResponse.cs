namespace u_lar_be.Features.Admin.Dtos;

public sealed record AdminDashboardResponse(
    int TotalStudents,
    int ActiveStudents,
    int InactiveStudents,
    int StudentsWhoHaveLoggedIn,
    IReadOnlyList<RecentStudentResponse> RecentStudents
);

public sealed record RecentStudentResponse(
    int Id,
    string Nim,
    string Name,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);