"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  playUISound as playManagedUISound,
  setUISoundEnabled as setManagedSoundEnabled,
  type UISoundName,
} from "@/lib/soundManager";

const UI_SOUND_STORAGE_KEY = "ui-sound-enabled";

type SoundContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  playUISound: (sound: UISoundName) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function readStoredSoundPreference() {
  try {
    return window.localStorage.getItem(UI_SOUND_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function storeSoundPreference(enabled: boolean) {
  try {
    window.localStorage.setItem(UI_SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Sound remains usable when storage is unavailable or blocked.
  }
}

export default function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const soundTogglePendingRef = useRef(false);
  const soundToggleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const restorePreference = window.setTimeout(() => {
      const enabled = readStoredSoundPreference();

      setSoundEnabledState(enabled);
      setManagedSoundEnabled(enabled);
    }, 0);

    return () => {
      window.clearTimeout(restorePreference);
      if (soundToggleTimerRef.current !== null) {
        window.clearTimeout(soundToggleTimerRef.current);
      }
    };
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    setManagedSoundEnabled(enabled);
    storeSoundPreference(enabled);
  }, []);

  const toggleSound = useCallback(() => {
    if (soundTogglePendingRef.current) return;

    if (soundEnabled) {
      soundTogglePendingRef.current = true;
      void playManagedUISound("switch");

      soundToggleTimerRef.current = window.setTimeout(() => {
        setSoundEnabledState(false);
        setManagedSoundEnabled(false);
        storeSoundPreference(false);
        soundTogglePendingRef.current = false;
        soundToggleTimerRef.current = null;
      }, 170);
      return;
    }

    setSoundEnabledState(true);
    setManagedSoundEnabled(true);
    storeSoundPreference(true);
    void playManagedUISound("switch");
  }, [soundEnabled]);

  const playUISound = useCallback(
    (sound: UISoundName) => {
      if (!soundEnabled) return;
      void playManagedUISound(sound);
    },
    [soundEnabled]
  );

  const value = useMemo(
    () => ({ soundEnabled, setSoundEnabled, toggleSound, playUISound }),
    [playUISound, setSoundEnabled, soundEnabled, toggleSound]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used inside SoundProvider.");
  }

  return context;
}
