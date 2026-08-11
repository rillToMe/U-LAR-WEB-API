using Scalar.AspNetCore;
using u_lar_be.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using u_lar_be.Domain.Users;
using u_lar_be.Infrastructure.Persistence;
using u_lar_be.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices()
    .AddOptionsConfiguration()
    .AddPersistence(builder.Configuration)
    .AddFeatureServices()
    .AddJwtAuthentication(builder.Configuration)
    .AddCorsConfiguration();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    var passwordHasher = scope.ServiceProvider
        .GetRequiredService<IPasswordHasher<User>>();

    await DbSeeder.SeedAsync(
        dbContext,
        passwordHasher);
}


// GlobalExceptionHandler mengubah semua unhandled exception jadi ProblemDetails.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    // Satu dokumen OpenAPI per versi API, ditemukan otomatis dari ApiExplorer.
    app.MapOpenApi().WithDocumentPerVersion();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("UlarAdminWeb");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
