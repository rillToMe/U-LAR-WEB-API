namespace u_lar_be.Common;

/// <summary>
/// Bentuk balasan standar untuk endpoint daftar yang dipaginasi, supaya
/// klien tahu ada berapa data total dan halaman mana yang sedang dilihat.
/// </summary>
public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalItems
)
{
    public int TotalPages =>
        TotalItems == 0
            ? 0
            : (int)Math.Ceiling(TotalItems / (double)PageSize);
}
