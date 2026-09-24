import { tokenize } from "./richTextFormat";

/**
 * Menampilkan isi materi dengan penanda formatnya: `**tebal**` dan `*miring*`.
 * Teks tanpa penanda dikembalikan apa adanya, dan penanda yang tidak lengkap
 * (mis. `**` tunggal) juga tampil apa adanya - tidak ada yang hilang.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((token, index) => {
        if (token.style === "bold") {
          return (
            <strong key={index} className="font-semibold text-fg">
              {token.text}
            </strong>
          );
        }

        if (token.style === "italic") {
          return <em key={index}>{token.text}</em>;
        }

        return <span key={index}>{token.text}</span>;
      })}
    </>
  );
}

