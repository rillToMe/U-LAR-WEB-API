namespace u_lar_be.Features.Admin.Materials.Dtos;

/// <summary>
/// Dipakai untuk membuat sekaligus mengubah materi. Seluruh blok isi dikirim
/// utuh setiap kali menyimpan - admin mengedit materi sebagai satu dokumen,
/// bukan per baris, jadi tidak ada endpoint terpisah untuk tiap blok.
///
/// Slug tidak ikut dikirim: alamat halaman materi diturunkan dari judul di
/// MaterialBankService supaya admin tidak perlu mengisinya sendiri.
/// </summary>
public sealed record SaveMaterialRequest(
    string ModuleCode,
    string Title,
    string Subtitle,
    int ReadMinutes,
    int OrderNumber,
    IReadOnlyList<SaveMaterialKeyPointRequest>? KeyPoints,
    IReadOnlyList<SaveMaterialCalloutRequest>? Callouts,
    IReadOnlyList<SaveMaterialDiagramRequest>? Diagrams,
    IReadOnlyList<SaveMaterialAccordionRequest>? Accordion
);

public sealed record SaveMaterialKeyPointRequest(string? Icon, string? Text);

public sealed record SaveMaterialCalloutRequest(
    string? Tone,
    string? Label,
    string? Body
);

public sealed record SaveMaterialDiagramRequest(string? ImageUrl, string? Caption);

public sealed record SaveMaterialAccordionRequest(string? Title, string? Body);

/// <summary>
/// Status aktif punya endpoint sendiri supaya menyunting isi materi tidak
/// diam-diam mengubah keterlihatannya ke mahasiswa.
/// </summary>
public sealed record UpdateMaterialStatusRequest(bool IsActive);
