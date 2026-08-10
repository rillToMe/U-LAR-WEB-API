# Entity Configurations

Satu file `IEntityTypeConfiguration<T>` per entity, dipungut otomatis oleh
`AppDbContext.OnModelCreating` via `ApplyConfigurationsFromAssembly`.
Taruh nama tabel, index, relasi, dan constraint di sini — bukan sebagai
atribut di kelas entity.
