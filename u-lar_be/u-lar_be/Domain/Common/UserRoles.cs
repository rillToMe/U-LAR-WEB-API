namespace u_lar_be.Domain.Common;

public static class UserRoles
{
    /// <summary>
    /// Admin biasa. Bisa mengelola materi, soal, dan mahasiswa, tapi tidak
    /// boleh menambah atau menghapus admin lain. Nilai ini disimpan di kolom
    /// <c>admins.role</c> dan juga dipakai sebagai claim role di JWT.
    /// </summary>
    public const string Admin = "ADMIN";

    /// <summary>
    /// Admin tingkat atas. Satu-satunya role yang boleh mengelola daftar admin
    /// (lihat <c>AdminUserController</c>). Hanya admin hasil seed bawaan yang
    /// punya role ini, dan akun itu tidak bisa dihapus dari aplikasi.
    /// </summary>
    public const string SuperAdmin = "SUPER_ADMIN";

    /// <summary>
    /// Role mahasiswa. Sengaja tidak diubah: nilai ini sudah dipakai di
    /// endpoint dan token mahasiswa yang sedang berjalan.
    /// </summary>
    public const string Student = "student";
}
