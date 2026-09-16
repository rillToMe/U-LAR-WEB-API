using Asp.Versioning;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using u_lar_be.Common.Exceptions;
using u_lar_be.Configuration.Options;
using u_lar_be.Infrastructure.Persistence;
using u_lar_be.Features.Auth;
using u_lar_be.Features.Admin;
using u_lar_be.Features.Admin.Students;
using u_lar_be.Features.Admin.Students.DTOs;
using u_lar_be.Domain.Common;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace u_lar_be.Configuration;

/// <summary>
/// Titik pusat registrasi Dependency Injection. Program.cs hanya memanggil
/// extension di sini supaya pipeline startup tetap ramping dan mudah dibaca.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>Controller, OpenAPI, dan penanganan error global.</summary>
    public static IServiceCollection AddApiServices(
        this IServiceCollection services)
    {
        services.AddControllers();

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
    
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwt = configuration
                      .GetSection(JwtOptions.SectionName)
                      .Get<JwtOptions>()
                  ?? throw new InvalidOperationException(
                      "Konfigurasi JWT belum tersedia.");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt.Key));

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var principal = context.Principal;
                        if (principal is null)
                        {
                            context.Fail("Principal tidak tersedia.");
                            return;
                        }

                        // Token mahasiswa berlaku lama (persistent login di
                        // game). Pastikan akun masih aktif setiap request —
                        // kalau admin menonaktifkan, request langsung ditolak.
                        var role = principal.FindFirstValue(ClaimTypes.Role);
                        if (role == UserRoles.Student)
                        {
                            var idClaim = principal.FindFirstValue(
                                ClaimTypes.NameIdentifier);
                            if (idClaim is null
                                || !int.TryParse(idClaim, out var studentId))
                            {
                                context.Fail("Token tidak valid.");
                                return;
                            }

                            var dbContext = context.HttpContext
                                .RequestServices
                                .GetRequiredService<AppDbContext>();

                            var studentExists = await dbContext.Students
                                .AnyAsync(
                                    x => x.Id == studentId && x.IsActive,
                                    context.HttpContext.RequestAborted);

                            if (!studentExists)
                            {
                                context.Fail(
                                    "Akun telah dinonaktifkan.");
                            }
                        }
                    }
                };

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,

                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,

                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddCorsConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var cors = configuration
                       .GetSection(CorsOptions.SectionName)
                       .Get<CorsOptions>()
                   ?? throw new InvalidOperationException(
                       "Konfigurasi CORS belum tersedia.");

        services.AddCors(options =>
        {
            options.AddPolicy("UlarAdminWeb", policy =>
            {
                policy
                    .WithOrigins(cors.AllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
    
    /// <summary>
    /// Binding seluruh konfigurasi appsettings ke strongly-typed options.
    /// ValidateOnStart membuat konfigurasi salah/kosong gagal saat startup,
    /// bukan saat request pertama masuk.
    /// </summary>
    public static IServiceCollection AddOptionsConfiguration(
        this IServiceCollection services)
    {
        services.AddOptions<JwtOptions>()
            .BindConfiguration(JwtOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<AdminSeedOptions>()
            .BindConfiguration(AdminSeedOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CorsOptions>()
            .BindConfiguration(CorsOptions.SectionName)
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
    public static IServiceCollection AddFeatureServices(
        this IServiceCollection services)
    {
        // PasswordHasher<T> tidak memakai T sama sekali, jadi satu registrasi
        // open generic cukup untuk Student maupun AdminUser.
        services.AddScoped(typeof(IPasswordHasher<>), typeof(PasswordHasher<>));
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IStudentService, StudentService>();
        
        return services;
    }
}
