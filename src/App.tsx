import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import ContactDetails from "./components/ContactDetails";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return localStorage.getItem("luxine_theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("luxine_theme", theme);
  }, [theme]);

  return (
    <div className={theme === "dark" ? "min-h-screen bg-[#0f0406] text-[#fcf9f8]" : "min-h-screen bg-[#fcf9f8] text-[#1c1b1b]"}>
      <header className={theme === "dark" ? "sticky top-0 z-40 flex items-center justify-between border-b border-red-950/15 bg-[#0f0507]/80 px-6 py-4 backdrop-blur-md md:px-12" : "sticky top-0 z-40 flex items-center justify-between border-b border-[#FFE4E4]/20 bg-white/80 px-6 py-4 backdrop-blur-md md:px-12"}>
        <span className={theme === "dark" ? "font-serif text-xl font-bold italic tracking-[0.1em] text-[#ffb3ae]" : "font-serif text-xl font-bold italic tracking-[0.1em] text-[#bd001d]"}>
          ELLA
        </span>
        <button
          type="button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={theme === "dark" ? "rounded-full border border-[#FFE4E4]/15 bg-[#1E0D10] p-2 text-[#ffb3ae] transition-colors hover:bg-[#261115]" : "rounded-full border border-[#FFE4E4]/40 bg-white p-2 text-[#6c5a5d] transition-colors hover:bg-[#FFF5F5]"}
          title="Toggle light and dark theme"
          aria-label="Toggle light and dark theme"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 md:px-12">
        <ContactDetails theme={theme} />
      </main>
    </div>
  );
}
