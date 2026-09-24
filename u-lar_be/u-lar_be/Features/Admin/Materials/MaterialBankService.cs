using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Domain.Materials;
using u_lar_be.Features.Admin.Materials.Dtos;
using u_lar_be.Infrastructure.Persistence;

namespace u_lar_be.Features.Admin.Materials;

/// <summary>
/// Bank Materi. Materi divalidasi di sini supaya halaman mahasiswa tidak
/// pernah menerima materi setengah jadi (judul kosong, poin tanpa teks, atau
/// kotak sorotan dengan warna yang tidak dikenal halaman).
///
/// Slug tidak diisi admin: alamat halaman materi selalu diturunkan dari judul.
/// </summary>
public sealed class MaterialBankService(AppDbContext dbContext)
    : IMaterialBankService
{
    private const int MaxSlugLength = 80;

    /// <summary>Batas percobaan akhiran angka saat slug sudah dipakai materi lain.</summary>
    private const int MaxSlugSuffixAttempts = 50;

    /// <summary>Alamat cadangan saat judul tidak menyisakan huruf/angka sama
    /// sekali, mis. judul yang seluruhnya simbol.</summary>
    private const string FallbackSlug = "materi";

    private const int MaxModuleCodeLength = 40;
    private const int MaxTitleLength = 150;
    private const int MaxSubtitleLength = 300;
    private const int MinReadMinutes = 1;
    private const int MaxReadMinutes = 120;

    /// <summary>Batas jumlah baris per blok supaya halaman materi tetap ringkas.</summary>
    private const int MaxBlocksPerSection = 20;

    private const int MaxIconLength = 40;
    private const int MaxKeyPointLength = 300;
    private const int MaxCalloutLabelLength = 60;
    private const int MaxCalloutBodyLength = 500;
    private const int MaxImageUrlLength = 300;
    private const int MaxDiagramCaptionLength = 200;
    private const int MaxAccordionTitleLength = 150;
    private const int MaxAccordionBodyLength = 2000;

    /// <summary>Nada kotak sorotan yang dikenal halaman materi.</summary>
    private static readonly string[] AllowedTones =
        ["info", "tip", "warn", "formula"];

    public async Task<IReadOnlyList<MaterialSummaryResponse>> GetMaterialsAsync(
        CancellationToken cancellationToken)
    {
        // Blok isi ikut terbaca karena tersimpan satu baris dengan materinya -
        // jumlahnya dipakai untuk ringkasan di tabel admin.
        var materials = await dbContext.Materials
            .AsNoTracking()
            .OrderBy(x => x.OrderNumber)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);

        return materials
            .Select(material => new MaterialSummaryResponse(
                material.Id,
                material.Slug,
                material.ModuleCode,
                material.Title,
                material.Subtitle,
                material.ReadMinutes,
                material.OrderNumber,
                material.IsActive,
                material.KeyPoints.Count,
                material.Callouts.Count,
                material.Accordion.Count,
                material.UpdatedAt))
            .ToList();
    }

    public async Task<MaterialDetailResponse> GetMaterialAsync(
        int materialId,
        CancellationToken cancellationToken)
    {
        var material = await FindMaterialAsync(materialId, cancellationToken);

        return new MaterialDetailResponse(
            material.Id,
            material.Slug,
            material.ModuleCode,
            material.Title,
            material.Subtitle,
            material.ReadMinutes,
            material.OrderNumber,
            material.IsActive,
            material.KeyPoints
                .Select(x => new MaterialKeyPointItem(x.Icon, x.Text))
                .ToList(),
            material.Callouts
                .Select(x => new MaterialCalloutItem(x.Tone, x.Label, x.Body))
                .ToList(),
            material.Diagrams
                .Select(x => new MaterialDiagramItem(x.ImageUrl, x.Caption))
                .ToList(),
            material.Accordion
                .Select(x => new MaterialAccordionEntry(x.Title, x.Body))
                .ToList(),
            material.UpdatedAt);
    }

    public async Task<int> CreateMaterialAsync(
        SaveMaterialRequest request,
        CancellationToken cancellationToken)
    {
        var title = ValidateRequired(
            request.Title,
            MaxTitleLength,
            "Judul materi");

        var slug = await BuildUniqueSlugAsync(title, null, cancellationToken);

        var material = new Material();

        Apply(material, slug, title, request);

        dbContext.Materials.Add(material);

        await dbContext.SaveChangesAsync(cancellationToken);

        return material.Id;
    }

    public async Task UpdateMaterialAsync(
        int materialId,
        SaveMaterialRequest request,
        CancellationToken cancellationToken)
    {
        var material = await FindMaterialAsync(materialId, cancellationToken);

        var title = ValidateRequired(
            request.Title,
            MaxTitleLength,
            "Judul materi");

        // Judul yang tidak berubah mempertahankan slug lama supaya alamat yang
        // sudah dibuka WebView game tidak mati hanya karena isi lain disunting.
        // Begitu judulnya berubah, slug ikut berubah.
        var slug = title == material.Title && material.Slug.Length > 0
            ? material.Slug
            : await BuildUniqueSlugAsync(title, materialId, cancellationToken);

        Apply(material, slug, title, request);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateStatusAsync(
        int materialId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var material = await FindMaterialAsync(materialId, cancellationToken);

        material.IsActive = isActive;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteMaterialAsync(
        int materialId,
        CancellationToken cancellationToken)
    {
        var material = await FindMaterialAsync(materialId, cancellationToken);

        dbContext.Materials.Remove(material);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Menimpa seluruh isi materi dari request. Mengganti koleksi (bukan
    /// menambah satu per satu) membuat hasil simpan selalu sama dengan yang
    /// dilihat admin di form - termasuk saat ada baris yang dihapus.
    /// </summary>
    private static void Apply(
        Material material,
        string slug,
        string title,
        SaveMaterialRequest request)
    {
        material.Slug = slug;
        material.Title = title;
        material.ModuleCode = ValidateRequired(
            request.ModuleCode,
            MaxModuleCodeLength,
            "Kode modul");
        material.Subtitle = ValidateRequired(
            request.Subtitle,
            MaxSubtitleLength,
            "Deskripsi singkat");
        material.ReadMinutes = ValidateReadMinutes(request.ReadMinutes);
        material.OrderNumber = ValidateOrderNumber(request.OrderNumber);

        material.KeyPoints = BuildKeyPoints(request.KeyPoints);
        material.Callouts = BuildCallouts(request.Callouts);
        material.Diagrams = BuildDiagrams(request.Diagrams);
        material.Accordion = BuildAccordion(request.Accordion);
    }

    private static List<MaterialKeyPoint> BuildKeyPoints(
        IReadOnlyList<SaveMaterialKeyPointRequest>? items)
    {
        var source = items ?? [];

        EnsureBlockCount(source.Count, "Poin penting");

        return source
            .Select(item => new MaterialKeyPoint
            {
                Icon = string.IsNullOrWhiteSpace(item.Icon)
                    ? "check"
                    : ValidateRequired(item.Icon, MaxIconLength, "Nama ikon"),
                Text = ValidateRequired(
                    item.Text,
                    MaxKeyPointLength,
                    "Teks poin penting")
            })
            .ToList();
    }

    private static List<MaterialCallout> BuildCallouts(
        IReadOnlyList<SaveMaterialCalloutRequest>? items)
    {
        var source = items ?? [];

        EnsureBlockCount(source.Count, "Catatan kunci");

        return source
            .Select(item =>
            {
                var tone = string.IsNullOrWhiteSpace(item.Tone)
                    ? "info"
                    : item.Tone.Trim().ToLowerInvariant();

                if (!AllowedTones.Contains(tone))
                {
                    throw new ValidationFailedException(
                        "Warna catatan harus salah satu dari: " +
                        string.Join(", ", AllowedTones) + ".");
                }

                return new MaterialCallout
                {
                    Tone = tone,
                    Label = ValidateRequired(
                        item.Label,
                        MaxCalloutLabelLength,
                        "Judul catatan"),
                    Body = ValidateRequired(
                        item.Body,
                        MaxCalloutBodyLength,
                        "Isi catatan")
                };
            })
            .ToList();
    }

    private static List<MaterialDiagram> BuildDiagrams(
        IReadOnlyList<SaveMaterialDiagramRequest>? items)
    {
        var source = items ?? [];

        EnsureBlockCount(source.Count, "Diagram");

        return source
            .Select(item =>
            {
                var imageUrl = NormalizeOptional(
                    item.ImageUrl,
                    MaxImageUrlLength,
                    "Alamat gambar");

                return new MaterialDiagram
                {
                    ImageUrl = imageUrl,
                    Caption = ValidateRequired(
                        item.Caption,
                        MaxDiagramCaptionLength,
                        "Keterangan diagram")
                };
            })
            .ToList();
    }

    private static List<MaterialAccordionItem> BuildAccordion(
        IReadOnlyList<SaveMaterialAccordionRequest>? items)
    {
        var source = items ?? [];

        EnsureBlockCount(source.Count, "Materi tambahan");

        return source
            .Select(item => new MaterialAccordionItem
            {
                Title = ValidateRequired(
                    item.Title,
                    MaxAccordionTitleLength,
                    "Judul materi tambahan"),
                Body = ValidateRequired(
                    item.Body,
                    MaxAccordionBodyLength,
                    "Isi materi tambahan")
            })
            .ToList();
    }

    private async Task<Material> FindMaterialAsync(
        int materialId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Materials
            .FirstOrDefaultAsync(x => x.Id == materialId, cancellationToken)
            ?? throw new NotFoundException(
                $"Materi dengan id {materialId} tidak ditemukan.");
    }

    /// <summary>
    /// Slug yang benar-benar dipakai materi: turunan judul, dan diberi akhiran
    /// angka kalau judul itu sudah dipakai materi lain ("kabel-straight-2").
    /// Admin tidak pernah diminta menyelesaikan bentrokan slug sendiri.
    /// </summary>
    private async Task<string> BuildUniqueSlugAsync(
        string title,
        int? exceptMaterialId,
        CancellationToken cancellationToken)
    {
        var baseSlug = Slugify(title);

        for (var attempt = 1; attempt <= MaxSlugSuffixAttempts; attempt++)
        {
            var candidate = attempt == 1
                ? baseSlug
                : AppendSuffix(baseSlug, attempt);

            var taken = await dbContext.Materials
                .AnyAsync(
                    x => x.Slug == candidate
                         && (exceptMaterialId == null || x.Id != exceptMaterialId),
                    cancellationToken);

            if (!taken)
            {
                return candidate;
            }
        }

        throw new ConflictException(
            $"Slug '{baseSlug}' sudah dipakai materi lain. Ubah judulnya sedikit.");
    }

    /// <summary>
    /// Judul jadi slug: huruf kecil, aksen dibuang, dan apa pun selain huruf
    /// atau angka jadi tanda hubung. Hasilnya selalu bentuk yang sah untuk
    /// alamat halaman materi, jadi tidak ada lagi slug yang perlu diperiksa.
    /// </summary>
    private static string Slugify(string title)
    {
        var builder = new StringBuilder(MaxSlugLength);
        var lastWasSeparator = false;

        // Bentuk NFD memisahkan aksen dari hurufnya ("é" jadi "e" + tanda),
        // jadi tandanya bisa dibuang dan huruf aslinya tetap terbaca.
        foreach (var character in title
                     .Trim()
                     .ToLowerInvariant()
                     .Normalize(NormalizationForm.FormD))
        {
            if (builder.Length >= MaxSlugLength)
            {
                break;
            }

            if (CharUnicodeInfo.GetUnicodeCategory(character)
                == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsAsciiLetterLower(character)
                || char.IsAsciiDigit(character))
            {
                builder.Append(character);
                lastWasSeparator = false;
                continue;
            }

            if (builder.Length > 0 && !lastWasSeparator)
            {
                builder.Append('-');
                lastWasSeparator = true;
            }
        }

        var slug = builder.ToString().TrimEnd('-');

        return slug.Length == 0 ? FallbackSlug : slug;
    }

    /// <summary>Akhiran angka untuk slug yang sudah terpakai, tetap muat di
    /// kolom slug (lihat MaxSlugLength).</summary>
    private static string AppendSuffix(string baseSlug, int suffix)
    {
        var suffixText = "-" + suffix.ToString(CultureInfo.InvariantCulture);
        var maxBaseLength = MaxSlugLength - suffixText.Length;

        var trimmed = baseSlug.Length > maxBaseLength
            ? baseSlug[..maxBaseLength].TrimEnd('-')
            : baseSlug;

        return trimmed + suffixText;
    }

    private static string ValidateRequired(
        string? text,
        int maxLength,
        string fieldName)
    {
        var value = text?.Trim() ?? string.Empty;

        if (value.Length == 0)
        {
            throw new ValidationFailedException($"{fieldName} wajib diisi.");
        }

        if (value.Length > maxLength)
        {
            throw new ValidationFailedException(
                $"{fieldName} maksimal {maxLength} karakter.");
        }

        return value;
    }

    private static string? NormalizeOptional(
        string? text,
        int maxLength,
        string fieldName)
    {
        var value = text?.Trim();

        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        if (value.Length > maxLength)
        {
            throw new ValidationFailedException(
                $"{fieldName} maksimal {maxLength} karakter.");
        }

        return value;
    }

    private static int ValidateReadMinutes(int readMinutes)
    {
        if (readMinutes is < MinReadMinutes or > MaxReadMinutes)
        {
            throw new ValidationFailedException(
                $"Estimasi waktu baca harus antara {MinReadMinutes} " +
                $"sampai {MaxReadMinutes} menit.");
        }

        return readMinutes;
    }

    private static int ValidateOrderNumber(int orderNumber)
    {
        if (orderNumber < 0)
        {
            throw new ValidationFailedException(
                "Urutan tampil tidak boleh negatif.");
        }

        return orderNumber;
    }

    private static void EnsureBlockCount(int count, string sectionName)
    {
        if (count > MaxBlocksPerSection)
        {
            throw new ValidationFailedException(
                $"{sectionName} maksimal {MaxBlocksPerSection} baris.");
        }
    }
}
