using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Users;
using u_lar_be.Features.Admin.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Admin;

public sealed class AdminService(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher
) : IAdminService
{
    public async Task<CreateStudentResponse> CreateStudentAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var nimExists = await dbContext.Users
            .AnyAsync(
                x => x.Nim == request.Nim,
                cancellationToken);

        if (nimExists)
        {
            throw new InvalidOperationException(
                "NIM sudah terdaftar.");
        }

        var emailExists = await dbContext.Users
            .AnyAsync(
                x => x.Email == request.Email,
                cancellationToken);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "Email sudah terdaftar.");
        }

        var student = new User
        {
            Nim = request.Nim,
            Name = request.Name,
            Email = request.Email,
            Role = UserRoles.Student,
            IsActive = true
        };

        student.PasswordHash = passwordHasher.HashPassword(
            student,
            request.Password);

        dbContext.Users.Add(student);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateStudentResponse(
            student.Id,
            student.Nim,
            student.Name,
            student.Email,
            student.Role);
    }
    
    public async Task<IReadOnlyList<StudentListItemResponse>> GetStudentsAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Where(x => x.Role == UserRoles.Student)
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