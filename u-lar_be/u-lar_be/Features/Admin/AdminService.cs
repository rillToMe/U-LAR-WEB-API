using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Common;
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
    /// <summary>Jumlah mahasiswa per halaman kalau klien tidak menentukan.</summary>
    public const int DefaultPageSize = 30;

    /// <summary>Batas atas supaya satu request tidak menarik seluruh tabel.</summary>
    public const int MaxPageSize = 100;

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
                $"NIM {request.Nim} sudah dipakai akun mahasiswa lain. " +
                "Periksa daftar mahasiswa atau gunakan NIM yang benar.");
        }

        var emailExists = await dbContext.Students
            .AnyAsync(
                x => x.Email == request.Email,
                cancellationToken);

        if (emailExists)
        {
            throw new ConflictException(
                $"Email {request.Email} sudah dipakai akun mahasiswa lain. " +
                "Gunakan email lain.");
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

    public async Task<PagedResult<StudentListItemResponse>> GetStudentsAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        // Nilai dari query string tidak dipercaya: halaman minimal 1 dan
        // jumlah per halaman dibatasi.
        var currentPage = page < 1 ? 1 : page;

        var currentPageSize = pageSize < 1
            ? DefaultPageSize
            : Math.Min(pageSize, MaxPageSize);

        var query = dbContext.Students
            .AsNoTracking();

        // Pencarian bebas di NIM, nama, dan email. Dipakai ToLower (bukan
        // LIKE dengan wildcard) supaya karakter % atau _ dari input tidak
        // dianggap wildcard.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();

            query = query.Where(x =>
                x.Nim.ToLower().Contains(term) ||
                x.Name.ToLower().Contains(term) ||
                x.Email.ToLower().Contains(term));
        }

        if (isActive is not null)
        {
            query = query.Where(x => x.IsActive == isActive);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nim)
            .Skip((currentPage - 1) * currentPageSize)
            .Take(currentPageSize)
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

        return new PagedResult<StudentListItemResponse>(
            items,
            currentPage,
            currentPageSize,
            totalItems);
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
                $"Mahasiswa dengan id {studentId} tidak ditemukan. " +
                "Data mungkin sudah dihapus, muat ulang halaman.");
        }

        var nimExists = await dbContext.Students
            .AnyAsync(
                x => x.Nim == request.Nim && x.Id != studentId,
                cancellationToken);

        if (nimExists)
        {
            throw new ConflictException(
                $"NIM {request.Nim} sudah dipakai akun mahasiswa lain. " +
                "Gunakan NIM yang berbeda.");
        }

        var emailExists = await dbContext.Students
            .AnyAsync(
                x => x.Email == request.Email && x.Id != studentId,
                cancellationToken);

        if (emailExists)
        {
            throw new ConflictException(
                $"Email {request.Email} sudah dipakai akun mahasiswa lain. " +
                "Gunakan email yang berbeda.");
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
