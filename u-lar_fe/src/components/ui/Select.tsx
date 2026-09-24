export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Label yang tampil di atas select. Kosong berarti select dipakai polos
   * (pemanggil mengatur lebarnya dan mengisi ariaLabel). */
  label?: string;
  /** Nama untuk screen reader saat label visualnya tidak dipakai. */
  ariaLabel?: string;
  className?: string;
}

export default function Select({
  id,
  value,
  options,
  onChange,
  label,
  ariaLabel,
  className = "",
}: SelectProps) {
  // Lebar, padding-y, dan ukuran huruf tidak diatur di sini; pemanggil
  // menentukannya lewat className (mis. "w-28 py-1.5 text-xs"). Jangan
  // menambahkan kelas untuk properti yang juga dikirim pemanggil: kalau ada
  // dua kelas untuk properti yang sama, pemenangnya ditentukan urutan CSS
  // Tailwind, bukan urutan penulisan kelasnya.
  const select = (
    <select
      id={id}
      value={value}
      aria-label={label === undefined ? ariaLabel : undefined}
      onChange={(event) => onChange(event.target.value)}
      className={`rounded-lg border border-border-strong bg-surface px-3 text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-border ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (label === undefined) {
    return select;
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-fg-muted"
      >
        {label}
      </label>

      {select}
    </div>
  );
}
