import type { Dispatch, SetStateAction } from "react";
import { useSound } from "@/components/SoundProvider";
import type { SiteLanguage } from "@/types";

type SwitcherTheme = {
  color: string;
  border: string;
  background: string;
};

type LanguageSwitcherProps = {
  language: SiteLanguage;
  setLanguage: Dispatch<SetStateAction<SiteLanguage>>;
  theme?: SwitcherTheme;
  slot?: "primary" | "secondary";
};

export default function LanguageSwitcher({
  language,
  setLanguage,
  theme,
  slot = "primary",
}: LanguageSwitcherProps) {
  const { playUISound } = useSound();
  const nextLanguage: SiteLanguage = language === "en" ? "zh" : "en";

  const currentTheme = theme ?? {
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    background: "rgba(0, 0, 0, 0.45)",
  };

  return (
    <button
      className={`house-control house-control--top-right-${slot}`}
      type="button"
      onClick={() => {
        playUISound("switch");
        setLanguage(nextLanguage);
      }}
      style={{
        padding: "8px 14px",
        borderRadius: "var(--radius-round)",
        border: currentTheme.border,
        background: currentTheme.background,
        color: currentTheme.color,
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        boxShadow: "var(--shadow-raised)",
      }}
    >
      {language === "en" ? "中文" : "EN"}
    </button>
  );
}
