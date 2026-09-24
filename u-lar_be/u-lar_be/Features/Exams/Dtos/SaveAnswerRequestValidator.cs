using FluentValidation;
using u_lar_be.Features.Exams.Dtos;

namespace u_lar_be.Features.Exams;

public sealed class SaveAnswerRequestValidator : AbstractValidator<SaveAnswerRequest>
{
    public SaveAnswerRequestValidator()
    {
        RuleFor(x => x.SelectedOptionId)
            .Must((request, _) =>
            {
                return request.SelectedOptionId != null || !string.IsNullOrWhiteSpace(request.AnswerText);
            })
            .WithMessage("Jawaban wajib diisi.");
    }
}
