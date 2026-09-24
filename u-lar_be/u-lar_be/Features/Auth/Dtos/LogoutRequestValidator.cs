using FluentValidation;
using u_lar_be.Features.Auth.Dtos;

namespace u_lar_be.Features.Auth;

public sealed class LogoutRequestValidator : AbstractValidator<LogoutRequest>
{
    public LogoutRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token wajib dikirim.");
    }
}
