namespace u_lar_be.Domain.Users;

using u_lar_be.Domain.Common;

public class User : BaseEntity
{
    public string Nim { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "student";

    public bool IsActive { get; set; } = true;

    public DateTime? LastLoginAt { get; set; }
}