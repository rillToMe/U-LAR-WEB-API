using FluentValidation;
using u_lar_be.Features.Admin.Exams.Dtos;

namespace u_lar_be.Features.Admin.Exams;

public sealed class SaveQuestionRequestValidator : AbstractValidator<SaveQuestionRequest>
{
    public SaveQuestionRequestValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Tipe soal wajib diisi.");

        RuleFor(x => x.QuestionText)
            .NotEmpty().WithMessage("Teks soal wajib diisi.")
            .MaximumLength(1000).WithMessage("Teks soal maksimal 1000 karakter.");

        RuleFor(x => x.Image)
            .MaximumLength(300).WithMessage("Gambar maksimal 300 karakter.");

        RuleFor(x => x.AnswerKey)
            .MaximumLength(2000).WithMessage("Kunci jawaban maksimal 2000 karakter.");

        RuleFor(x => x.Options)
            .Must((request, options) =>
            {
                var type = request.Type?.Trim().ToLowerInvariant();

                if (type == "multiple_choice")
                {
                    return options != null && options.Count >= 2 && options.Count <= 10;
                }

                return true;
            })
            .WithMessage("Soal pilihan ganda harus memiliki 2 hingga 10 pilihan jawaban.");
    }
}
