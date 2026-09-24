/**
 * Aturan penanda format isi materi: `**tebal**` dan `*miring*`. Bukan Markdown
 * penuh, jadi diurai sendiri tanpa pustaka tambahan. Dipakai bersama oleh
 * halaman materi (menampilkan) dan editor admin (menulis).
 */

/** Teks hasil pemasangan penanda beserta posisi pilihan barunya. */
export interface MarkedText {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

interface Token {
  style: "plain" | "bold" | "italic";
  text: string;
}

/** Memotong teks jadi potongan biasa/tebal/miring dalam satu kali jalan. */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let plain = "";
  let index = 0;

  function flushPlain() {
    if (plain !== "") {
      tokens.push({ style: "plain", text: plain });
      plain = "";
    }
  }

  while (index < text.length) {
    // Tebal diperiksa lebih dulu supaya `**` tidak terbaca sebagai dua miring.
    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);

      if (end > index + 2) {
        flushPlain();
        tokens.push({ style: "bold", text: text.slice(index + 2, end) });
        index = end + 2;
        continue;
      }
    }

    if (text[index] === "*") {
      const end = text.indexOf("*", index + 1);

      if (end > index + 1) {
        flushPlain();
        tokens.push({ style: "italic", text: text.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }

    plain += text[index];
    index += 1;
  }

  flushPlain();

  return tokens;
}

/**
 * Membungkus pilihan dengan penanda (`**` tebal atau `*` miring), atau
 * melepas penandanya kalau pilihan itu memang sudah ditandai. Dipakai tombol
 * toolbar dan pintasan Ctrl/Cmd+B, Ctrl/Cmd+I di editor.
 */
export function toggleMarker(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  marker: string
): MarkedText {
  const width = marker.length;
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);

  // Kursor sudah berada di dalam penanda: `**|teks**`.
  if (before.endsWith(marker) && after.startsWith(marker)) {
    return {
      value: before.slice(0, -width) + selected + after.slice(width),
      selectionStart: selectionStart - width,
      selectionEnd: selectionEnd - width,
    };
  }

  // Penandanya ikut terpilih: `**|teks|**`.
  if (
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    selected.length > width * 2
  ) {
    const inner = selected.slice(width, -width);

    return {
      value: before + inner + after,
      selectionStart,
      selectionEnd: selectionStart + inner.length,
    };
  }

  // Belum ditandai: bungkus pilihannya. Pilihan kosong jadi sepasang penanda
  // dengan kursor di tengahnya.
  return {
    value: `${before}${marker}${selected}${marker}${after}`,
    selectionStart: selectionStart + width,
    selectionEnd: selectionEnd + width,
  };
}
