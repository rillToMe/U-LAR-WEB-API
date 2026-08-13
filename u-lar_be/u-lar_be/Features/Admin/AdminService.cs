using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;
using u_lar_be.Features.Admin.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Admin;

public sealed class AdminService(
    AppDbContext dbContext,
    IPasswordHasher<Student> passwordHasher
) : IAdminService
{
    public async Task<CreateStudentResponse> CreateStudentAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var nimExists = await dbContext.Students
            .AnyAsync(
                x => x.Nim == request.Nim,
                cancellationToken);

        if (nimExists)
        {
            throw new ConflictException(
                "NIM sudah terdaftar.");
        }

        var emailExists = await dbContext.Students
            .AnyAsync(
                x => x.Email == request.Email,
                cancellationToken);

        if (emailExists)
        {
            throw new ConflictException(
                "Email sudah terdaftar.");
        }

        var student = new Student
        {
            Nim = request.Nim,
            Name = request.Name,
            Email = request.Email,
            IsActive = true
        };

        student.PasswordHash = passwordHasher.HashPassword(
            student,
            request.Password);

        dbContext.Students.Add(student);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateStudentResponse(
            student.Id,
            student.Nim,
            student.Name,
            student.Email,
            UserRoles.Student);
    }

    public async Task<IReadOnlyList<StudentListItemResponse>> GetStudentsAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Students
            .AsNoTracking()
            .OrderBy(x => x.Nim)
            .Select(x => new StudentListItemResponse(
                x.Id,
                x.Nim,
                x.Name,
                x.Email,
                x.IsActive,
                x.LastLoginAt,
                x.CreatedAt
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<UpdateStudentResponse> UpdateStudentAsync(
        int studentId,
        UpdateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .SingleOrDefaultAsync(
                x => x.Id == studentId,
                cancellationToken);

        if (student is null)
        {
            throw new NotFoundException(
                "Student tidak ditemukan.");
        }

        var nimExists = await dbContext.Students
            .AnyAsync(
                x => x.Nim == request.Nim && x.Id != studentId,
                cancellationToken);

        if (nimExists)
        {
            throw new ConflictException(
                "NIM sudah terdaftar.");
        }

        var emailExists = await dbContext.Students
            .AnyAsync(
                x => x.Email == request.Email && x.Id != studentId,
                cancellationToken);

        if (emailExists)
        {
            throw new ConflictException(
                "Email sudah terdaftar.");
        }

        student.Nim = request.Nim;
        student.Name = request.Name;
        student.Email = request.Email;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateStudentResponse(
            "Student updated successfully");
    }
    
    public async Task<AdminDashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken)
    {
        var totalStudents = await dbContext.Students
            .CountAsync(cancellationToken);

        var activeStudents = await dbContext.Students
            .CountAsync(
                x => x.IsActive,
                cancellationToken);

        var inactiveStudents = totalStudents - activeStudents;

        var studentsWhoHaveLoggedIn = await dbContext.Students
            .CountAsync(
                x => x.LastLoginAt != null,
                cancellationToken);

        var recentStudents = await dbContext.Students
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(5)
            .Select(x => new RecentStudentResponse(
                x.Id,
                x.Nim,
                x.Name,
                x.IsActive,
                x.CreatedAt,
                x.LastLoginAt
            ))
            .ToListAsync(cancellationToken);

        return new AdminDashboardResponse(
            totalStudents,
            activeStudents,
            inactiveStudents,
            studentsWhoHaveLoggedIn,
            recentStudents
        );
    }
}
