namespace u_lar_be.Features.Admin.Admins.DTOs;

public sealed class CreateAdminRequest
{
    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
