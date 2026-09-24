using FluentValidation;
using u_lar_be.Features.Auth.Dtos;

namespace u_lar_be.Features.Auth;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Nim)
            .NotEmpty().WithMessage("NIM wajib diisi.")
            .Length(8, 20).WithMessage("NIM harus terdiri dari 8 hingga 20 karakter.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password wajib diisi.")
            .MinimumLength(8).WithMessage("Password minimal 8 karakter.");
    }
}
