# Features — Vertical Slice

Satu folder per fitur, isinya lengkap dan mandiri:

```
Features/
  Auth/
    AuthController.cs      -> boleh juga ditaruh di /Controllers, pilih satu, konsisten
    Dtos/                  -> request & response record
    IAuthService.cs
    AuthService.cs         -> business logic fitur ini
    AuthValidators.cs      -> FluentValidation, kalau sudah dipasang
```

Aturan:

- Service query lewat `AppDbContext` + LINQ. Tidak ada raw SQL.
- Lempar `NotFoundException` / `ConflictException` dsb. dari `Common/Exceptions`;
  Controller tidak menangkap exception.
- Registrasi DI-nya satu baris di `Configuration/ServiceCollectionExtensions.AddFeatureServices`.
- Antar-fitur tidak saling import service. Yang dipakai bersama naik ke `Common/` atau `Domain/`.
- Mahasiswa tidak register sendiri tapi admin yang akan membuatkan akun untuk Mahasiswa
