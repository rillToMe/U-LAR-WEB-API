namespace u_lar_be.Features.Admin.Admins.DTOs;

/// <summary>
/// Ubah username, password, dan/atau status aktif satu admin.
///
/// <c>Password</c> boleh null atau kosong berarti "jangan diubah" — jadi
/// superadmin bisa mengganti username saja tanpa mengetik ulang password.
/// <c>IsActive</c> null berarti "jangan diubah" juga; yang diisi berarti
/// akun akan dinonaktifkan (tidak bisa login, sesi lamanya ditolak) atau
/// diaktifkan kembali.
/// </summary>
public sealed class UpdateAdminRequest
{
    public string? Username { get; set; }

    public string? Password { get; set; }

    public bool? IsActive { get; set; }
}
