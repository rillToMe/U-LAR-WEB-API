namespace u_lar_be.Features.Materials.Dtos;

/// <summary>
/// Isi satu materi pembelajaran yang siap dirender halaman materi (WebView
/// game). Bentuknya sengaja "siap pakai": halaman cukup menampilkan, bukan
/// menyusun ulang.
/// </summary>
public sealed record MaterialResponse(
    string Slug,
    string ModuleCode,
    string Title,
    string Subtitle,
    int ReadMinutes,
    IReadOnlyList<MaterialKeyPointResponse> KeyPoints,
    IReadOnlyList<MaterialCalloutResponse> Callouts,
    IReadOnlyList<MaterialDiagramResponse> Diagrams,
    IReadOnlyList<MaterialAccordionResponse> Accordion
);

/// <summary>
/// <c>Icon</c> adalah nama ikon yang dikenal halaman materi (mis. "wire",
/// "check", "plug"). Nama yang tidak dikenal tetap tampil sebagai penanda
/// biasa, jadi penulis konten tidak bisa merusak halaman.
/// </summary>
public sealed record MaterialKeyPointResponse(string Icon, string Text);

/// <summary><c>Tone</c> menentukan warna kotak: info | tip | warn | formula.</summary>
public sealed record MaterialCalloutResponse(string Tone, string Label, string Body);

/// <summary><c>ImageUrl</c> boleh kosong - halaman tetap menyediakan bingkai
/// diagram responsif di tempatnya.</summary>
public sealed record MaterialDiagramResponse(string? ImageUrl, string Caption);

public sealed record MaterialAccordionResponse(string Title, string Body);

/// <summary>Ringkasan materi untuk daftar di halaman materi.</summary>
public sealed record MaterialListItemResponse(
    string Slug,
    string ModuleCode,
    string Title,
    string Subtitle,
    int ReadMinutes
);
