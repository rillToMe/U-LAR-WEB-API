using u_lar_be.Features.Auth.Dtos;

namespace u_lar_be.Features.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken);

    Task<AdminLoginResponse> LoginAdminAsync(
        AdminLoginRequest request,
        CancellationToken cancellationToken);

    Task<RefreshTokenResponse> RefreshStudentTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken);

    Task LogoutStudentAsync(
        LogoutRequest request,
        CancellationToken cancellationToken);
}
