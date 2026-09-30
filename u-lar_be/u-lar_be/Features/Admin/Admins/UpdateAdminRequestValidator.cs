using FluentValidation;
using u_lar_be.Features.Admin.Admins.DTOs;

namespace u_lar_be.Features.Admin.Admins;

public sealed class UpdateAdminRequestValidator : AbstractValidator<UpdateAdminRequest>
{
    public UpdateAdminRequestValidator()
    {
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Username)
                || !string.IsNullOrEmpty(x.Password)
                || x.IsActive is not null)
            .WithMessage("Isi username, password, atau status aktif — atau beberapa sekaligus.");

        RuleFor(x => x.Username)
            .MinimumLength(3)
            .When(x => !string.IsNullOrWhiteSpace(x.Username))
            .WithMessage("Username harus terdiri dari 3 hingga 50 karakter.")
            .MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.Username))
            .Matches("^[A-Za-z0-9._-]+$")
            .When(x => !string.IsNullOrWhiteSpace(x.Username))
            .WithMessage("Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip.");

        RuleFor(x => x.Password)
            .Length(8, 100)
            .When(x => !string.IsNullOrEmpty(x.Password))
            .WithMessage("Password harus terdiri dari 8 hingga 100 karakter.");
    }
}
