using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using u_lar_be.Domain.Materials;

namespace u_lar_be.Infrastructure.Persistence.Configurations;

public sealed class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.ToTable("materials");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Slug)
            .HasMaxLength(80)
            .IsRequired();

        // Slug adalah alamat halaman materi - tidak boleh kembar.
        builder.HasIndex(x => x.Slug)
            .IsUnique();

        builder.Property(x => x.ModuleCode)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(x => x.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Subtitle)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(x => x.ReadMinutes)
            .IsRequired();

        builder.Property(x => x.OrderNumber)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        // Daftar materi mahasiswa selalu disaring aktif lalu diurutkan.
        builder.HasIndex(x => new { x.IsActive, x.OrderNumber });

        // Blok isi disimpan satu kolom JSON per jenis, bukan tabel terpisah.
        builder.OwnsMany(x => x.KeyPoints, navigation => navigation.ToJson());
        builder.OwnsMany(x => x.Callouts, navigation => navigation.ToJson());
        builder.OwnsMany(x => x.Diagrams, navigation => navigation.ToJson());
        builder.OwnsMany(x => x.Accordion, navigation => navigation.ToJson());
    }
}
