using FluentValidation;
using u_lar_be.Features.Auth.Dtos;

namespace u_lar_be.Features.Auth;

public sealed class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token wajib dikirim.");
    }
}
