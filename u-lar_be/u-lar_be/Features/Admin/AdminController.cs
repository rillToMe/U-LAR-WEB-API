using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Admin.Dtos;
using u_lar_be.Features.Admin.Students;
using u_lar_be.Features.Admin.Students.DTOs;

namespace u_lar_be.Features.Admin;

[Authorize(Roles = UserRoles.Admin)]
public sealed class AdminController(
    IAdminService adminService,
    IStudentService studentService
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
    
    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardResponse>> GetDashboard(
        CancellationToken cancellationToken)
    {
        var dashboard = await adminService.GetDashboardAsync(
            cancellationToken);

        return Ok(dashboard);
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

    [HttpGet("students/{id}")]
    public async Task<ActionResult<StudentDetailResponse>> GetStudentDetail(
        int id,
        CancellationToken cancellationToken)
    {
        var student = await studentService.GetDetailAsync(
            id,
            cancellationToken);

        if(student is null)
        {
            return NotFound();
        }

        return Ok(student);
    }

    [HttpPut("students/{id}")]
    public async Task<ActionResult<UpdateStudentResponse>> UpdateStudent(
        int id,
        UpdateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var response = await adminService.UpdateStudentAsync(
            id,
            request,
            cancellationToken);

        return Ok(response);
    }
    
    [HttpPatch("students/{id}/status")]
    public async Task<IActionResult> UpdateStudentStatus(
        int id,
        UpdateStudentStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await studentService.UpdateStatusAsync(
            id,
            request.IsActive,
            cancellationToken);


        if (!result)
        {
            return NotFound();
        }


        return Ok(new
        {
            message = request.IsActive
                ? "Mahasiswa berhasil diaktifkan."
                : "Mahasiswa berhasil dinonaktifkan."
        });
    }
    
    [HttpPost("students/{id}/reset-password")]
    public async Task<IActionResult> ResetStudentPassword(
        int id,
        ResetStudentPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result =
            await studentService.ResetPasswordAsync(
                id,
                request.NewPassword,
                cancellationToken
            );


        if (!result)
        {
            return NotFound();
        }


        return Ok(new
        {
            message = "Password mahasiswa berhasil direset."
        });
    }
}