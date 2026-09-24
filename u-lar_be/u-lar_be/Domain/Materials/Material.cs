using u_lar_be.Domain.Common;

namespace u_lar_be.Domain.Materials;

/// <summary>
/// Satu materi pembelajaran yang diisi admin lewat Bank Materi dan dibaca
/// mahasiswa di halaman materi (WebView game).
///
/// Isi yang bentuknya daftar (poin penting, kotak sorotan, diagram, accordion)
/// disimpan sebagai kolom JSON lewat <c>OwnsMany(...).ToJson()</c>: materi
/// selalu dibaca dan ditulis sebagai satu kesatuan, jadi memecahnya menjadi
/// tabel-tabel terpisah hanya menambah join tanpa manfaat.
/// </summary>
public class Material : BaseEntity
{
    /// <summary>Kunci yang dipakai alamat halaman materi: /materi.html?slug=...</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Teks badge modul di halaman materi, mis. "MODUL 01".</summary>
    public string ModuleCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Subtitle { get; set; } = string.Empty;

    /// <summary>Perkiraan lama membaca, hanya untuk ditampilkan.</summary>
    public int ReadMinutes { get; set; } = 5;

    /// <summary>Urutan tampil di daftar materi.</summary>
    public int OrderNumber { get; set; }

    /// <summary>Materi nonaktif tidak muncul di halaman mahasiswa.</summary>
    public bool IsActive { get; set; } = true;

    public ICollection<MaterialKeyPoint> KeyPoints { get; set; } = [];

    public ICollection<MaterialCallout> Callouts { get; set; } = [];

    public ICollection<MaterialDiagram> Diagrams { get; set; } = [];

    public ICollection<MaterialAccordionItem> Accordion { get; set; } = [];
}

/// <summary>Butir "Poin Penting". <c>Icon</c> adalah nama ikon yang dikenal
/// halaman materi; nama tak dikenal tetap tampil sebagai penanda biasa.</summary>
public class MaterialKeyPoint
{
    public string Icon { get; set; } = "check";

    public string Text { get; set; } = string.Empty;
}

/// <summary>Kotak sorotan. <c>Tone</c>: info | tip | warn | formula.</summary>
public class MaterialCallout
{
    public string Tone { get; set; } = "info";

    public string Label { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;
}

/// <summary><c>ImageUrl</c> boleh kosong - halaman tetap menampilkan bingkai
/// diagram di tempatnya.</summary>
public class MaterialDiagram
{
    public string? ImageUrl { get; set; }

    public string Caption { get; set; } = string.Empty;
}

/// <summary>Satu kartu accordion: penjelasan tambahan atau glosarium.</summary>
public class MaterialAccordionItem
{
    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;
}
