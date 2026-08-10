using Scalar.AspNetCore;
using u_lar_be.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices()
    .AddOptionsConfiguration()
    .AddPersistence(builder.Configuration)
    .AddFeatureServices();

var app = builder.Build();

// GlobalExceptionHandler mengubah semua unhandled exception jadi ProblemDetails.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    // Satu dokumen OpenAPI per versi API, ditemukan otomatis dari ApiExplorer.
    app.MapOpenApi().WithDocumentPerVersion();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
