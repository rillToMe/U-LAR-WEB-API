using u_lar_be.Features.Auth.Dtos;

namespace u_lar_be.Features.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken);
}