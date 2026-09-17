using Microsoft.EntityFrameworkCore;
using u_lar_be.Domain.Common;
using u_lar_be.Domain.Exams;
using u_lar_be.Domain.Users;

namespace u_lar_be.Infrastructure.Persistence;

/// <summary>
/// Satu-satunya pintu akses database. Semua query WAJIB lewat LINQ di atas
/// DbSet — tidak ada raw SQL / string query di project ini.
/// Konfigurasi entity ditaruh sebagai IEntityTypeConfiguration di folder
/// Infrastructure/Persistence/Configurations dan dipungut otomatis.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> Admins => Set<AdminUser>();

    public DbSet<Student> Students => Set<Student>();

    public DbSet<StudentRefreshToken> StudentRefreshTokens =>
        Set<StudentRefreshToken>();

    public DbSet<Exam> Exams => Set<Exam>();

    public DbSet<ExamQuestion> ExamQuestions => Set<ExamQuestion>();

    public DbSet<ExamOption> ExamOptions => Set<ExamOption>();

    public DbSet<ExamResult> ExamResults => Set<ExamResult>();

    public DbSet<ExamAnswer> ExamAnswers => Set<ExamAnswer>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        ApplyTimestamps();
        return base.SaveChanges();
    }

    /// <summary>Mengisi created_at / updated_at otomatis untuk semua BaseEntity.</summary>
    private void ApplyTimestamps()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }

            if (entry.State is EntityState.Added or EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
