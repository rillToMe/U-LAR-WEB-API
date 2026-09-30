using Asp.Versioning;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;
using u_lar_be.Common.Exceptions;
using u_lar_be.Configuration.Options;
using u_lar_be.Infrastructure.Persistence;
using u_lar_be.Features.Auth;
using u_lar_be.Features.Admin;
using u_lar_be.Features.Admin.Admins;
using u_lar_be.Features.Admin.Students;
using u_lar_be.Features.Admin.Exams;
using u_lar_be.Features.Admin.Students.DTOs;
using u_lar_be.Features.Admin.Materials;
using u_lar_be.Features.Admin.Media;
using u_lar_be.Features.Exams;
using u_lar_be.Features.Materials;
using u_lar_be.Domain.Common;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace u_lar_be.Configuration;

public static class ServiceCollectionExtensions
{
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

        // 12 validator di folder Features aktif lewat pipeline MVC:
        // gagal validasi → 400 ValidationProblemDetails (errors per field).
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddFluentValidationAutoValidation();

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
                        var log = context.HttpContext.RequestServices
                            .GetRequiredService<ILoggerFactory>()
                            .CreateLogger("JwtAuth");

                        var principal = context.Principal;
                        if (principal is null)
                        {
                            log.LogWarning("Token validasi gagal: principal null [{TraceId}]",
                                context.HttpContext.TraceIdentifier);
                            context.Fail("Principal tidak tersedia.");
                            return;
                        }
                        var role = principal.FindFirstValue(ClaimTypes.Role);
                        var idClaim = principal.FindFirstValue(
                            ClaimTypes.NameIdentifier);
                        var dbContext = context.HttpContext
                            .RequestServices
                            .GetRequiredService<AppDbContext>();

                        // Role dibaca dari token, tapi token bisa berumur 15
                        // menit dan harus tetap mencerminkan perubahan role
                        // di database. Karena itu baik mahasiswa maupun admin
                        // dicek ulang ke sini: akun yang dinonaktifkan atau
                        // role-nya diturunkan langsung kehilangan akses, bukan
                        // menunggu tokennya kedaluwarsa.
                        if (role == UserRoles.Student)
                        {
                            if (idClaim is null
                                || !int.TryParse(idClaim, out var studentId))
                            {
                                log.LogWarning("Token validasi gagal: claim id tidak valid [{TraceId}]",
                                    context.HttpContext.TraceIdentifier);
                                context.Fail("Token tidak valid.");
                                return;
                            }

                            var studentExists = await dbContext.Students
                                .AnyAsync(
                                    x => x.Id == studentId && x.IsActive,
                                    context.HttpContext.RequestAborted);

                            if (!studentExists)
                            {
                                log.LogWarning(
                                    "Token ditolak: mahasiswa {StudentId} nonaktif/tidak ada [{TraceId}]",
                                    studentId, context.HttpContext.TraceIdentifier);
                                context.Fail(
                                    "Akun telah dinonaktifkan.");
                            }

                            return;
                        }

                        if (role is not (UserRoles.Admin or UserRoles.SuperAdmin))
                        {
                            log.LogWarning(
                                "Token ditolak: role '{Role}' tidak dikenal [{TraceId}]",
                                role, context.HttpContext.TraceIdentifier);
                            context.Fail("Token tidak valid.");
                            return;
                        }

                        if (idClaim is null
                            || !int.TryParse(idClaim, out var adminId))
                        {
                            log.LogWarning("Token validasi gagal: claim id admin tidak valid [{TraceId}]",
                                context.HttpContext.TraceIdentifier);
                            context.Fail("Token tidak valid.");
                            return;
                        }

                        var admin = await dbContext.Admins
                            .Where(x => x.Id == adminId)
                            .Select(x => new { x.IsActive, x.Role })
                            .SingleOrDefaultAsync(
                                context.HttpContext.RequestAborted);

                        if (admin is null || !admin.IsActive)
                        {
                            log.LogWarning(
                                "Token ditolak: admin {AdminId} nonaktif/tidak ada [{TraceId}]",
                                adminId, context.HttpContext.TraceIdentifier);
                            context.Fail("Akun telah dinonaktifkan.");
                            return;
                        }

                        // Superadmin di-downgrade ke admin biasa harus kehilangan
                        // claim SUPER_ADMIN yang sudah tercetak di tokennya.
                        // Arahnya satu: role yang hilang di DBDicabut, role
                        // yang baru di DB baru berlaku setelah login ulang.
                        var allowedRoles = admin.Role == UserRoles.SuperAdmin
                            ? new[] { UserRoles.Admin, UserRoles.SuperAdmin }
                            : new[] { UserRoles.Admin };

                        var hasStaleRole = principal
                            .FindAll(ClaimTypes.Role)
                            .Any(x => !allowedRoles.Contains(x.Value));

                        if (hasStaleRole)
                        {
                            log.LogWarning(
                                "Token ditolak: role admin {AdminId} berubah di database [{TraceId}]",
                                adminId, context.HttpContext.TraceIdentifier);
                            context.Fail("Hak akses Anda berubah. Silakan masuk kembali.");
                        }
                    },

                    // Tantangan default hanya mengirim status kosong — isi body
                    // ProblemDetails supaya frontend punya `code` untuk
                    // diterjemahkan (tanpa ini user hanya lihat 401 hampa).
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();
                        await WriteAuthProblem(
                            context.HttpContext,
                            StatusCodes.Status401Unauthorized,
                            "unauthorized",
                            "Sesi tidak valid atau sudah berakhir.");
                    },

                    OnForbidden = async context =>
                    {
                        await WriteAuthProblem(
                            context.HttpContext,
                            StatusCodes.Status403Forbidden,
                            "forbidden",
                            "Anda tidak punya akses ke resource ini.");
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

    public static IServiceCollection AddRateLimitConfiguration(
        this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode =
                StatusCodes.Status429TooManyRequests;

            // Default-nya 429 tanpa body. Frontend ini sudah terbiasa membaca
            // ProblemDetails, jadi ditulis dengan bentuk yang sama.
            options.OnRejected = async (context, cancellationToken) =>
            {
                await WriteAuthProblem(
                    context.HttpContext,
                    StatusCodes.Status429TooManyRequests,
                    "too_many_requests",
                    "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.");
            };

            options.AddPolicy(RateLimitPolicy.AdminLogin, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });

        return services;
    }

    /// <summary>
    /// Menulis ProblemDetails berisi `code` untuk respons 401/403/429 yang
    /// datang dari pipeline JWT dan rate limiter (bukan dari
    /// GlobalExceptionHandler).
    /// </summary>
    private static async Task WriteAuthProblem(
        HttpContext httpContext,
        int status,
        string code,
        string detail)
    {
        if (httpContext.Response.HasStarted)
        {
            return;
        }

        httpContext.Response.StatusCode = status;

        var problem = new Microsoft.AspNetCore.Mvc.ProblemDetails
        {
            Status = status,
            Title = status switch
            {
                StatusCodes.Status401Unauthorized => "Tidak terautentikasi.",
                StatusCodes.Status429TooManyRequests => "Terlalu banyak permintaan.",
                _ => "Akses ditolak."
            },
            Detail = detail,
            Instance = httpContext.Request.Path
        };
        problem.Extensions["code"] = code;
        problem.Extensions["traceId"] = httpContext.TraceIdentifier;

        await httpContext.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: "application/problem+json");
    }

    public static IServiceCollection AddCorsConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var cors = configuration
                       .GetSection(CorsOptions.SectionName)
                       .Get<CorsOptions>()
                   ?? throw new InvalidOperationException(
                       "Konfigurasi CORS belum tersedia. Isi section Cors di appsettings.json.");

        services.AddCors(options =>
        {
            options.AddPolicy("UlarAdminWeb", policy =>
            {
                policy.AllowAnyHeader().AllowAnyMethod();

                // "*" = buka semua origin (AllowAnyOrigin).
                // WithOrigins tidak menerima wildcard, jadi bercabang di sini.
                if (cors.AllowedOrigins.Contains("*"))
                    policy.AllowAnyOrigin();
                else
                    policy.WithOrigins(cors.AllowedOrigins);
            });
        });

        return services;
    }
    
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

        services.AddOptions<MediaStorageOptions>()
            .BindConfiguration(MediaStorageOptions.SectionName)
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
                                   "ConnectionStrings:Postgres belum diisi. Isi via .env (lihat .env.example).");

        services.AddDbContext<AppDbContext>(options => options
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention());

        services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("postgres");

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
    services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IExamBankService, ExamBankService>();
        services.AddScoped<IMaterialService, MaterialService>();
        services.AddScoped<IMaterialBankService, MaterialBankService>();
        services.AddScoped<IMediaService, MediaService>();
        
        return services;
    }
}
