using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Admin.Dtos;

namespace u_lar_be.Features.Admin;

[Authorize(Roles = UserRoles.Admin)]
public sealed class AdminController(
    IAdminService adminService
) : ApiControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new
        {
            message = "Admin access berhasil.",
            role = UserRoles.Admin
        });
    }

    [HttpGet("students")]
    public async Task<ActionResult<IReadOnlyList<StudentListItemResponse>>> GetStudents(
        CancellationToken cancellationToken)
    {
        var students = await adminService.GetStudentsAsync(
            cancellationToken);

        return Ok(students);
    }

    [HttpPost("students")]
    public async Task<ActionResult<CreateStudentResponse>> CreateStudent(
        CreateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var response = await adminService.CreateStudentAsync(
            request,
            cancellationToken);

        return Ok(response);
    }
}