using FluentValidation;
using u_lar_be.Features.Admin.Exams.Dtos;

namespace u_lar_be.Features.Admin.Exams;

public sealed class UpdateExamRequestValidator : AbstractValidator<UpdateExamRequest>
{
    public UpdateExamRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Judul ujian wajib diisi.")
            .MaximumLength(150).WithMessage("Judul ujian maksimal 150 karakter.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Deskripsi ujian maksimal 500 karakter.");

        RuleFor(x => x.PassingScore)
            .InclusiveBetween(0, 100).WithMessage("Nilai minimal kelulusan harus antara 0 hingga 100.");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(1, 600).WithMessage("Durasi ujian harus antara 1 hingga 600 menit.");
    }
}
