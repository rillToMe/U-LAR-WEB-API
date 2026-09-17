import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import IconButton from "../ui/IconButton";
import { ThemeContext } from "./themeContext";
import type { Theme } from "./themeContext";
import { useTheme } from "./themeContext";

const STORAGE_KEY = "u-lar-theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    // Sinkron dengan script anti-kilatan di index.html: warna dasar & UI
    // browser (status bar) ikut berubah saat tema diganti, bukan hanya saat
    // halaman pertama dibuka.
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.backgroundColor =
      theme === "dark" ? "#101216" : "#f9fafb";

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton
      onClick={toggleTheme}
      label={
        isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
      }
      title={isDark ? "Mode terang" : "Mode gelap"}
    >
      <span className="relative block size-5 overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`absolute inset-0 size-5 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0"
          }`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`absolute inset-0 size-5 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
            isDark
              ? "rotate-90 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </IconButton>
  );
}
