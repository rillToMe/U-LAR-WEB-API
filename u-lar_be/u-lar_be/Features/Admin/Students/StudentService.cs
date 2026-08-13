using Microsoft.EntityFrameworkCore;
using u_lar_be.Features.Admin.Students.DTOs;
using u_lar_be.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using u_lar_be.Domain.Users;

namespace u_lar_be.Features.Admin.Students;

public sealed class StudentService(
    AppDbContext dbContext,
    IPasswordHasher<Student> passwordHasher
) : IStudentService
{
    public async Task<StudentDetailResponse?> GetDetailAsync(
        int studentId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Students
            .AsNoTracking()
            .Where(x => x.Id == studentId)
            .Select(x => new StudentDetailResponse
            {
                Id = x.Id,
                Nim = x.Nim,
                Name = x.Name,
                Email = x.Email,
                IsActive = x.IsActive,

                // sementara belum ada tabel progress
                ProgressPercentage = 0,

                TotalMissionCompleted = 0,

                AverageScore = null
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
    public async Task<bool> ResetPasswordAsync(
        int studentId,
        string newPassword,
        CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .FirstOrDefaultAsync(
                x => x.Id == studentId,
                cancellationToken);


        if (student is null)
        {
            return false;
        }


        student.PasswordHash =
            passwordHasher.HashPassword(
                student,
                newPassword
            );


        await dbContext.SaveChangesAsync(
            cancellationToken
        );


        return true;
    }
    
    public async Task<bool> UpdateStatusAsync(
        int studentId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .FirstOrDefaultAsync(
                x => x.Id == studentId,
                cancellationToken);


        if (student is null)
        {
            return false;
        }


        student.IsActive = isActive;


        await dbContext.SaveChangesAsync(
            cancellationToken
        );


        return true;
    }
}