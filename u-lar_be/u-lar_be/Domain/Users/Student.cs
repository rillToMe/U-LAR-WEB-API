namespace u_lar_be.Domain.Users;

using u_lar_be.Domain.Common;

/// <summary>
/// Mahasiswa pemain game AR. Semua tabel progress (misi, exam, refleksi)
/// nanti FK ke students.id — bukan ke tabel gabungan, supaya admin tidak
/// mungkin punya data belajar.
/// </summary>
public class Student : BaseEntity
{
    public string Nim { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime? LastLoginAt { get; set; }
}
