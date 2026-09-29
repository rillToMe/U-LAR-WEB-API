using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Domain.Common;
using u_lar_be.Features.Admin.Admins.DTOs;

namespace u_lar_be.Features.Admin.Admins;

/// <summary>
/// Kelola daftar admin. Seluruh controller ini dibatasi superadmin lewat
/// atribut di bawah, jadi admin biasa tetap bisa masuk ke /admin tapi tidak
/// bisa menyentuh endpoint ini.
/// </summary>
[Authorize(Roles = UserRoles.SuperAdmin)]
public sealed class AdminUserController(
    IAdminUserService adminUserService
) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminListItemResponse>>> GetAdmins(
        CancellationToken cancellationToken)
    {
        var admins = await adminUserService.GetAllAsync(
            cancellationToken);

        return Ok(admins);
    }

    [HttpPost]
    public async Task<ActionResult<AdminListItemResponse>> CreateAdmin(
        CreateAdminRequest request,
        CancellationToken cancellationToken)
    {
        var admin = await adminUserService.CreateAsync(
            request,
            cancellationToken);

        return Ok(admin);
    }

    /// <summary>
    /// Ganti username dan/atau password satu admin. Berlaku juga untuk akun
    /// superadmin yang sedang login, jadi superadmin bisa mengganti
    /// kredensialnya sendiri. Password yang dikosongkan tidak diubah.
    /// </summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<AdminListItemResponse>> UpdateAdmin(
        int id,
        UpdateAdminRequest request,
        CancellationToken cancellationToken)
    {
        var admin = await adminUserService.UpdateAsync(
            id,
            request,
            cancellationToken);

        return Ok(admin);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAdmin(
        int id,
        CancellationToken cancellationToken)
    {
        await adminUserService.DeleteAsync(
            id,
            CurrentUserId,
            cancellationToken);

        return Ok(new
        {
            message = "Admin berhasil dihapus."
        });
    }
}
