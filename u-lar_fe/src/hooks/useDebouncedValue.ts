import { useEffect, useState } from "react";

/**
 * Mengembalikan `value` yang baru ikut berubah setelah nilainya diam
 * selama `delay` milidetik. Dipakai untuk menahan pencarian supaya API
 * tidak dipanggil pada tiap ketikan, dan supaya hasil yang tampil tidak
 * berkedip mengikuti ketikan yang belum selesai.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
