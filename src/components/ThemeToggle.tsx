import { useEffect, useState } from "react";
import { Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Theme = "light" | "dark" | "deepblue" | "eyegreen";

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "明亮", icon: "☀️" },
  { value: "dark", label: "极客", icon: "🌙" },
  { value: "deepblue", label: "深夜蓝", icon: "🌊" },
  { value: "eyegreen", label: "护眼绿", icon: "🌿" },
];

function getSystemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(): Theme {
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored && themes.some((t) => t.value === stored)) return stored;
  return getSystemIsDark() ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.add("disable-transitions");
  html.offsetHeight;

  html.classList.remove("dark", "theme-deepblue", "theme-eyegreen");

  if (theme === "light") {
    // no extra class needed
  } else if (theme === "dark") {
    html.classList.add("dark");
  } else if (theme === "deepblue") {
    html.classList.add("dark", "theme-deepblue");
  } else if (theme === "eyegreen") {
    html.classList.add("dark", "theme-eyegreen");
  }

  setTimeout(() => {
    html.classList.remove("disable-transitions");
  }, 150);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = resolveTheme();
    setTheme(t);
    applyTheme(t);

    function onPageLoad() {
      const t = resolveTheme();
      setTheme(t);
      applyTheme(t);
    }
    document.addEventListener("astro:page-load", onPageLoad);
    return () => document.removeEventListener("astro:page-load", onPageLoad);
  }, []);

  function selectTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    localStorage.setItem("theme", t);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label="切换主题"
        className="transition-transform duration-200 active:scale-90"
      >
        <div className="relative w-5 h-5">
          <Sun
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
              theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
            }`}
          />
          <Moon
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
              theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
            }`}
          />
          <Palette
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
              theme === "deepblue" || theme === "eyegreen" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[100] w-36 py-1.5 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-xl">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => selectTheme(t.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150 hover:bg-muted/50 ${
                  theme === t.value ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
                {theme === t.value && (
                  <svg className="w-3.5 h-3.5 ml-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
