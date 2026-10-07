/**
 * Jembatan kecil ke WebView game (Unity).
 *
 * Halaman ujian dan materi hanya dijalankan di dalam WebView, tapi student
 * juga bisa membuka alamat yang sama di browser HP sendiri. Karena itu semua
 * pemanggilan ke bridge wajib lewat `isRunningInUnity()` dulu, supaya di
 * browser biasa tombolnya disembunyikan, bukan jadi tombol mati.
 */

/**
 * Pesan yang dipahami `WebViewController` (Assets/01_Scripts/WebView).
 * Harus sama dengan konstanta di sisi C#.
 */
export const UNITY_CLOSE_WEBVIEW = "CloseWebView";

/**
 * Pesan yang dikirim halaman web minta sesi mahasiswa yang sudah login di
 * game. Harus sama dengan konstanta di sisi C#.
 */
export const UNITY_REQUEST_SESSION = "RequestSession";

/**
 * Nama fungsi global yang dipanggil Unity untuk kirim balik sesi. Diset sekali
 * saat komponen halaman ujian selesai mount, sebelum request dikirim, supaya
 * jawabannya tidak datang sebelum pendengarnya siap.
 */
const SESSION_HANDLER = "__onUnityExamSession";

export interface UnityExamSession {
  token: string;
  nim: string;
  name: string;
  role: string;
}

declare global {
  interface Window {
    /** Disuntikkan plugin net.gree.unity-webview. */
    Unity?: { call: (message: string) => void };
    [SESSION_HANDLER]?: (session: UnityExamSession | null) => void;
  }
}

/** Benar kalau halaman ini berada di dalam WebView game. */
export function isRunningInUnity(): boolean {
  return typeof window !== "undefined" && Boolean(window.Unity);
}

/**
 * Minta game mengirim sesi mahasiswa yang aktif.
 *
 * Dijawab lewat `EvaluateJS` yang memanggil fungsi global, bukan balasan
 * langsung ke `call()`. Alasannya plugin hanya meneruskan pesan web ke C#;
 * jalan sebaliknya harus lewat EvaluateJS, yang tidak punya nilai balik.
 *
 * Mengembalikan fungsi berhenti; aman dipanggil dari komponen yang di-unmount.
 */
export function requestUnityExamSession(
  onSession: (session: UnityExamSession | null) => void
): () => void {
  if (!isRunningInUnity()) {
    return () => {};
  }

  window[SESSION_HANDLER] = onSession;

  window.Unity?.call(UNITY_REQUEST_SESSION);

  return () => {
    if (window[SESSION_HANDLER] === onSession) {
      delete window[SESSION_HANDLER];
    }
  };
}

/**
 * Minta game menutup WebView dan kembali ke scene MainMenu.
 * Mengembalikan false kalau tidak dijalankan dari dalam game.
 */
export function closeWebView(): boolean {
  if (!isRunningInUnity()) {
    return false;
  }

  window.Unity?.call(UNITY_CLOSE_WEBVIEW);

  return true;
}
