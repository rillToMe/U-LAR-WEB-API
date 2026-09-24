using dotenv.net;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;
using u_lar_be.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Configuration.Options;
using u_lar_be.Domain.Users;
using u_lar_be.Infrastructure.Persistence;
using u_lar_be.Infrastructure.Persistence.Seed;

// .env dimuat dulu supaya IConfiguration melihat secrets sebagai env vars.
// overwriteExistingVars: false — environment asli (CI/production) tetap menang.
// probeForEnv: true — .env ditemukan walau CWD bukan folder project (dotnet ef, IDE).
DotEnv.Load(new DotEnvOptions(overwriteExistingVars: false, probeForEnv: true));

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices()
    .AddOptionsConfiguration()
    .AddPersistence(builder.Configuration)
    .AddFeatureServices()
    .AddJwtAuthentication(builder.Configuration)
    .AddCorsConfiguration(builder.Configuration);

builder.Services.AddScoped<
    IPasswordHasher<Student>,
    PasswordHasher<Student>
>();

builder.Services.AddScoped<
    IPasswordHasher<AdminUser>,
    PasswordHasher<AdminUser>
>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    var passwordHasher = scope.ServiceProvider
        .GetRequiredService<IPasswordHasher<AdminUser>>();

    var seedOptions = scope.ServiceProvider
        .GetRequiredService<IOptions<AdminSeedOptions>>()
        .Value;

    await DbSeeder.SeedAsync(dbContext, passwordHasher, seedOptions);
    await MaterialSeeder.SeedAsync(dbContext);
}

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().WithDocumentPerVersion();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("UlarAdminWeb");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check bawaan (tanpa package): GET /health -> 200 "Healthy".
// Publik tanpa auth, untuk VPS / load balancer / uptime monitor.
app.MapHealthChecks("/health");

app.Run();
