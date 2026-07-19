import type { Mode, Screen, SiteLanguage } from "@/types";
import { useSound } from "@/components/SoundProvider";

type SwitcherTheme = {
  color: string;
  border: string;
  background: string;
  mutedColor: string;
};

export default function ModeSwitcher({
  mode,
  screen,
  changeMode,
  language,
  theme,
}: {
  mode: Mode;
  screen: Screen;
  changeMode: () => void;
  language: SiteLanguage;
  theme?: SwitcherTheme;
}) {
  const { playUISound } = useSound();

  if (!mode || screen === "entrance") return null;

  const currentTheme = theme ?? {
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.75)",
    background: "transparent",
    mutedColor: "#aaa",
  };

  const modeText =
    mode === "casual"
      ? language === "en"
        ? "Browse Freely"
        : "自由参观"
      : language === "en"
        ? "explore"
        : "探索模式";

  return (
    <div
      className="house-control house-control--top-right-primary"
      style={{
        textAlign: "right",
      }}
    >
      <button
        onClick={() => {
          playUISound("switch");
          changeMode();
        }}
        style={{
          padding: "10px 18px",
          minHeight: "44px",
          borderRadius: "var(--radius-control)",
          border: currentTheme.border,
          background: currentTheme.background,
          color: currentTheme.color,
          cursor: "pointer",
          boxShadow: "var(--shadow-raised)",
          backdropFilter: "blur(8px)",
        }}
      >
        {language === "en" ? "Switch Mode" : "切换模式"}
      </button>

      <div
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: currentTheme.mutedColor,
        }}
      >
        {language === "en" ? "Current mode" : "当前模式"}: {modeText}
      </div>
    </div>
  );
}
