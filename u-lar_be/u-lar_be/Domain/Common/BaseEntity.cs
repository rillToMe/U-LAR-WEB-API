namespace u_lar_be.Domain.Common;

/// <summary>
/// Kolom yang dipakai semua tabel U-LAR (id, created_at, updated_at).
/// Nama kolom snake_case dihasilkan otomatis oleh naming convention EF Core.
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
