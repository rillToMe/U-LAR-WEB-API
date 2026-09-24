namespace u_lar_be.Features.Admin.Materials.Dtos;

/// <summary>Satu baris pada daftar Bank Materi di web admin.</summary>
public sealed record MaterialSummaryResponse(
    int Id,
    string Slug,
    string ModuleCode,
    string Title,
    string Subtitle,
    int ReadMinutes,
    int OrderNumber,
    bool IsActive,
    int KeyPointCount,
    int CalloutCount,
    int AccordionCount,
    DateTime UpdatedAt
);

/// <summary>
/// Isi lengkap satu materi untuk halaman kelola admin - termasuk materi yang
/// sedang nonaktif, supaya bisa disunting sebelum diaktifkan lagi.
/// </summary>
public sealed record MaterialDetailResponse(
    int Id,
    string Slug,
    string ModuleCode,
    string Title,
    string Subtitle,
    int ReadMinutes,
    int OrderNumber,
    bool IsActive,
    IReadOnlyList<MaterialKeyPointItem> KeyPoints,
    IReadOnlyList<MaterialCalloutItem> Callouts,
    IReadOnlyList<MaterialDiagramItem> Diagrams,
    IReadOnlyList<MaterialAccordionEntry> Accordion,
    DateTime UpdatedAt
);

public sealed record MaterialKeyPointItem(string Icon, string Text);

public sealed record MaterialCalloutItem(string Tone, string Label, string Body);

public sealed record MaterialDiagramItem(string? ImageUrl, string Caption);

/// <summary>Dinamai "Entry", bukan "Item", supaya tidak bentrok dengan
/// entity <c>Domain.Materials.MaterialAccordionItem</c>.</summary>
public sealed record MaterialAccordionEntry(string Title, string Body);
