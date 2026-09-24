using FluentValidation;
using u_lar_be.Features.Admin.Materials.Dtos;

namespace u_lar_be.Features.Admin.Materials;

/// <summary>
/// Validasi bentuk request Bank Materi. Isi baris (poin, catatan, diagram,
/// materi tambahan) divalidasi di service karena bergantung pada jenis blok.
/// Slug tidak divalidasi di sini karena diturunkan dari judul di service.
/// </summary>
public sealed class SaveMaterialRequestValidator
    : AbstractValidator<SaveMaterialRequest>
{
    public SaveMaterialRequestValidator()
    {
        RuleFor(x => x.ModuleCode)
            .NotEmpty().WithMessage("Kode modul wajib diisi.")
            .MaximumLength(40).WithMessage("Kode modul maksimal 40 karakter.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Judul materi wajib diisi.")
            .MaximumLength(150).WithMessage("Judul materi maksimal 150 karakter.");

        RuleFor(x => x.Subtitle)
            .NotEmpty().WithMessage("Deskripsi singkat wajib diisi.")
            .MaximumLength(300)
            .WithMessage("Deskripsi singkat maksimal 300 karakter.");

        RuleFor(x => x.ReadMinutes)
            .InclusiveBetween(1, 120)
            .WithMessage("Estimasi waktu baca harus antara 1 sampai 120 menit.");

        RuleFor(x => x.OrderNumber)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Urutan tampil tidak boleh negatif.");
    }
}
