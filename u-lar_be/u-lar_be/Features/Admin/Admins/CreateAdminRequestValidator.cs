using FluentValidation;
using u_lar_be.Features.Admin.Admins.DTOs;

namespace u_lar_be.Features.Admin.Admins;

public sealed class CreateAdminRequestValidator : AbstractValidator<CreateAdminRequest>
{
    public CreateAdminRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username wajib diisi.")
            .Length(3, 50).WithMessage("Username harus terdiri dari 3 hingga 50 karakter.")
            .Matches("^[A-Za-z0-9._-]+$")
            .WithMessage("Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password wajib diisi.")
            .Length(8, 100).WithMessage("Password harus terdiri dari 8 hingga 100 karakter.");
    }
}
