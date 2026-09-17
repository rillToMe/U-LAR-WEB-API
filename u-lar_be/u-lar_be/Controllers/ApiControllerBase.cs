using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace u_lar_be.Controllers;

/// <summary>
/// Base seluruh controller U-LAR: route ber-versi "api/v{version}/[controller]"
/// dan model binding validation otomatis dari [ApiController].
/// Controller tanpa atribut [ApiVersion] otomatis ikut DefaultApiVersion (1.0),
/// jadi tidak perlu menulis versi di tiap controller. Pasang [ApiVersion(2.0)]
/// hanya pada controller yang memang pindah versi.
/// Controller HANYA memetakan request ke service pada Features lalu
/// mengembalikan response — tanpa business logic dan tanpa try/catch
/// (ditangani <see cref="Common.Exceptions.GlobalExceptionHandler"/>).
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Id pemilik token yang sedang request (admin ATAU mahasiswa — id-nya
    /// boleh bertabrakan karena tabelnya terpisah, jadi selalu dipakai
    /// bersama role dari token). Endpoint ber-[Authorize] selalu punya claim
    /// ini, jadi bagian pemanggil tidak perlu mengecek null.
    /// </summary>
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
