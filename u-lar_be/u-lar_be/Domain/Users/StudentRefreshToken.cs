using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Users;

public class StudentRefreshToken : BaseEntity
{
    public int StudentId { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public Student Student { get; set; } = null!;
}
