using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Users;

/// <summary>
/// Sesi admin yang bisa dicabut. Access token JWT sendiri stateless dan
/// tidak bisa ditarik, jadi yang dicabut di sini adalah refresh token —
/// tanpa baris ini, satu-satunya cara mengakhiri sesi admin adalah
/// menunggu tokennya kedaluwarsa.
/// </summary>
public class AdminRefreshToken : BaseEntity
{
    public int AdminId { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// Batas idle, digeser ulang setiap kali token ini dipakai. Berbeda
    /// dengan <see cref="BaseEntity.CreatedAt"/> yang tidak pernah berubah,
    /// nilai inilah yang membuat sesi aktif bisa terus berjalan.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public AdminUser Admin { get; set; } = null!;
}
