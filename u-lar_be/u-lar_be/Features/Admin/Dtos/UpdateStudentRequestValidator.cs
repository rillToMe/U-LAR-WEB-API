using FluentValidation;
using u_lar_be.Features.Admin.Dtos;

namespace u_lar_be.Features.Admin;

public sealed class UpdateStudentRequestValidator : AbstractValidator<UpdateStudentRequest>
{
    public UpdateStudentRequestValidator()
    {
        RuleFor(x => x.Nim)
            .NotEmpty().WithMessage("NIM wajib diisi.")
            .Length(8, 20).WithMessage("NIM harus terdiri dari 8 hingga 20 karakter.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nama wajib diisi.")
            .Length(2, 100).WithMessage("Nama harus terdiri dari 2 hingga 100 karakter.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email wajib diisi.")
            .MaximumLength(150).WithMessage("Email maksimal 150 karakter.")
            .EmailAddress().WithMessage("Format email tidak valid.");
    }
}
