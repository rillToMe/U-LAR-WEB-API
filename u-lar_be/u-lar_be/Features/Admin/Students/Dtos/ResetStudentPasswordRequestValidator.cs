using FluentValidation;
using u_lar_be.Features.Admin.Students.DTOs;

namespace u_lar_be.Features.Admin.Students;

public sealed class ResetStudentPasswordRequestValidator : AbstractValidator<ResetStudentPasswordRequest>
{
    public ResetStudentPasswordRequestValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Password baru wajib diisi.")
            .Length(8, 100).WithMessage("Password baru harus terdiri dari 8 hingga 100 karakter.");
    }
}
