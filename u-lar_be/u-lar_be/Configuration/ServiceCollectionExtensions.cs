using Asp.Versioning;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Common.Exceptions;
using u_lar_be.Configuration.Options;
using u_lar_be.Infrastructure.Persistence;
using u_lar_be.Features.Auth;

namespace u_lar_be.Configuration;

/// <summary>
/// Titik pusat registrasi Dependency Injection. Program.cs hanya memanggil
/// extension di sini supaya pipeline startup tetap ramping dan mudah dibaca.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>Controller, OpenAPI, dan penanganan error global.</summary>
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddControllers();

        // Versi API dibaca dari segmen URL (api/v1/...). Controller tanpa
        // [ApiVersion] ikut DefaultApiVersion, dan SubstituteApiVersionInUrl
        // membuat OpenAPI menampilkan /api/v1/... bukan /api/v{version}/...
        services.AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.ApiVersionReader = new UrlSegmentApiVersionReader();
                options.ReportApiVersions = true;
            })
            .AddMvc()
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            })
            .AddOpenApi();

        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();

        return services;
    }

    /// <summary>
    /// Binding seluruh konfigurasi appsettings ke strongly-typed options.
    /// ValidateOnStart membuat konfigurasi salah/kosong gagal saat startup,
    /// bukan saat request pertama masuk.
    /// </summary>
    public static IServiceCollection AddOptionsConfiguration(this IServiceCollection services)
    {
        services.AddOptions<JwtOptions>()
            .BindConfiguration(JwtOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }

    /// <summary>EF Core + PostgreSQL. Satu-satunya jalur akses database.</summary>
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres")
                               ?? throw new InvalidOperationException(
                                   "ConnectionStrings:Postgres belum diisi di appsettings.");

        services.AddDbContext<AppDbContext>(options => options
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention());

        return services;
    }

    /// <summary>
    /// Service milik tiap vertical slice di folder Features.
    /// Tambahkan registrasi per fitur di sini, satu baris per fitur.
    /// </summary>
    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}
