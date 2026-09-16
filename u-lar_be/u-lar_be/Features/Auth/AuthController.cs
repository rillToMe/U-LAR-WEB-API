using Microsoft.AspNetCore.Mvc;
using u_lar_be.Controllers;
using u_lar_be.Features.Auth.Dtos;

namespace u_lar_be.Features.Auth;

public sealed class AuthController(
    IAuthService authService
) : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(
            request,
            cancellationToken);

        return Ok(response);
    }

    [HttpPost("admin/login")]
    public async Task<ActionResult<AdminLoginResponse>> LoginAdmin(
        AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.LoginAdminAsync(
            request,
            cancellationToken);

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenResponse>> Refresh(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.RefreshStudentTokenAsync(
            request,
            cancellationToken);

        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        LogoutRequest request,
        CancellationToken cancellationToken)
    {
        await authService.LogoutStudentAsync(
            request,
            cancellationToken);

        return NoContent();
    }
}
