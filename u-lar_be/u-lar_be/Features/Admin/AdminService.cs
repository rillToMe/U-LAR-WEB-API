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
}
