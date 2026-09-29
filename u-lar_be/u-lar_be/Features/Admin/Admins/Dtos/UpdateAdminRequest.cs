namespace u_lar_be.Features.Admin.Admins.DTOs;

/// <summary>
/// Ubah username dan/atau password satu admin.
///
/// <c>Password</c> boleh null atau kosong berarti "jangan diubah" — jadi
/// superadmin bisa mengganti username saja tanpa mengetik ulang password.
/// </summary>
public sealed class UpdateAdminRequest
{
    public string? Username { get; set; }

    public string? Password { get; set; }
}
