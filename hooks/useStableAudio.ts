"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "stalled"
  | "error";

type AudioFailure = {
  name: string;
  message: string;
  mediaErrorCode?: number;
};

const debugAudio = process.env.NODE_ENV === "development";

function finiteDuration(audio: HTMLAudioElement) {
  return Number.isFinite(audio.duration) && audio.duration > 0
    ? audio.duration
    : 0;
}

function bufferedEnd(audio: HTMLAudioElement) {
  return audio.buffered.length > 0
    ? audio.buffered.end(audio.buffered.length - 1)
    : 0;
}

export function useStableAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const sourceRef = useRef(src);
  const restoreTimeRef = useRef(0);
  const recoveryAttemptedRef = useRef(false);
  const retryTaskRef = useRef<number | null>(null);
  const [status, setStatus] = useState<AudioStatus>(src ? "loading" : "idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [failure, setFailure] = useState<AudioFailure | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const log = useCallback((event: string, details?: Record<string, unknown>) => {
    if (!debugAudio) return;
    const audio = audioRef.current;
    console.info("[audio]", event, {
      src: sourceRef.current,
      readyState: audio?.readyState,
      networkState: audio?.networkState,
      paused: audio?.paused,
      currentTime: audio?.currentTime,
      duration: audio?.duration,
      ...details,
    });
  }, []);

  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  const startLoadingTimer = useCallback(() => {
    clearLoadingTimer();
    loadingTimerRef.current = window.setTimeout(() => {
      const audio = audioRef.current;
      if (audio && audio.readyState < HTMLMediaElement.HAVE_METADATA) {
        setStatus("stalled");
        log("metadata_timeout");
      }
    }, 12_000);
  }, [clearLoadingTimer, log]);

  useEffect(() => {
    const audio = audioRef.current;
    sourceRef.current = src;
    recoveryAttemptedRef.current = false;
    if (retryTaskRef.current !== null) {
      window.clearTimeout(retryTaskRef.current);
      retryTaskRef.current = null;
    }
    restoreTimeRef.current = 0;
    clearLoadingTimer();
    // The source identity changes the external media element and its entire UI snapshot.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setFailure(null);
    setRetryAttempts(0);

    if (!audio || !src) {
      setStatus("idle");
      return;
    }

    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // Some WebViews reject seeking before metadata exists.
    }
    audio.src = src;
    audio.preload = "metadata";
    audio.load();
    setStatus("loading");
    startLoadingTimer();
    log("source_initialized");

    return () => {
      clearLoadingTimer();
      if (retryTaskRef.current !== null) {
        window.clearTimeout(retryTaskRef.current);
        retryTaskRef.current = null;
      }
    };
  }, [clearLoadingTimer, log, src, startLoadingTimer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const ready = (event: string) => {
      clearLoadingTimer();
      setDuration(finiteDuration(audio));
      setBuffered(bufferedEnd(audio));
      setFailure(null);
      setStatus(audio.paused ? "ready" : "playing");
      if (restoreTimeRef.current > 0 && finiteDuration(audio) > 0) {
        audio.currentTime = Math.min(restoreTimeRef.current, finiteDuration(audio));
        restoreTimeRef.current = 0;
      }
      log(event);
    };
    const handlers: Record<string, EventListener> = {
      loadstart: () => { setStatus("loading"); startLoadingTimer(); log("loadstart"); },
      loadedmetadata: () => ready("loadedmetadata"),
      loadeddata: () => ready("loadeddata"),
      canplay: () => ready("canplay"),
      playing: () => { clearLoadingTimer(); setStatus("playing"); setFailure(null); log("playing"); },
      pause: () => { setStatus((value) => value === "error" || value === "loading" ? value : "paused"); log("pause"); },
      waiting: () => { if (!audio.paused) setStatus("stalled"); log("waiting"); },
      stalled: () => { setStatus("stalled"); log("stalled"); },
      suspend: () => log("suspend"),
      emptied: () => { setStatus(sourceRef.current ? "loading" : "idle"); log("emptied"); },
      ended: () => { setStatus("paused"); setCurrentTime(finiteDuration(audio)); log("ended"); },
      durationchange: () => { setDuration(finiteDuration(audio)); log("durationchange"); },
      timeupdate: () => setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0),
      progress: () => setBuffered(bufferedEnd(audio)),
      error: () => {
        clearLoadingTimer();
        const mediaErrorCode = audio.error?.code;
        setStatus("error");
        setFailure({ name: "MediaError", message: "The audio resource could not be loaded.", mediaErrorCode });
        log("error", { mediaErrorCode });
      },
    };
    for (const [event, handler] of Object.entries(handlers)) audio.addEventListener(event, handler);
    return () => {
      for (const [event, handler] of Object.entries(handlers)) audio.removeEventListener(event, handler);
    };
  }, [clearLoadingTimer, log, startLoadingTimer]);

  const recoverIfNeeded = useCallback((event: string) => {
    const audio = audioRef.current;
    log(event);
    if (!audio || !sourceRef.current || recoveryAttemptedRef.current) return;
    const needsLoad = audio.networkState === HTMLMediaElement.NETWORK_EMPTY || Boolean(audio.error);
    if (!needsLoad || audio.readyState >= HTMLMediaElement.HAVE_METADATA) return;
    recoveryAttemptedRef.current = true;
    restoreTimeRef.current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    audio.load();
    setFailure(null);
    setStatus("loading");
    startLoadingTimer();
  }, [log, startLoadingTimer]);

  useEffect(() => {
    const handleVisibility = () => {
      log("visibilitychange", { visibility: document.visibilityState });
      if (document.visibilityState === "visible") recoverIfNeeded("visibility_recovery");
    };
    const handlePageShow = () => recoverIfNeeded("pageshow");
    const handlePageHide = () => {
      const audio = audioRef.current;
      if (audio) restoreTimeRef.current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      log("pagehide");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [log, recoverIfNeeded]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    const playPromise = audio.play() as Promise<void> | undefined;
    log("play_called");
    if (!playPromise || typeof playPromise.then !== "function") return;
    void playPromise.then(() => {
      setFailure(null);
      setStatus("playing");
      log("play_resolved");
    }).catch((error: unknown) => {
      const name = error instanceof DOMException || error instanceof Error ? error.name : "PlaybackError";
      const message = error instanceof DOMException || error instanceof Error ? error.message : "Playback was rejected.";
      setStatus("error");
      setFailure({ name, message, mediaErrorCode: audio.error?.code });
      log("play_rejected", { name, message, mediaErrorCode: audio.error?.code });
    });
  }, [log]);

  const retry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !sourceRef.current || retryAttempts >= 2 || retryTaskRef.current !== null) return;
    const resumeAt = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    audio.pause();
    restoreTimeRef.current = resumeAt;
    recoveryAttemptedRef.current = false;
    setFailure(null);
    setDuration(0);
    setBuffered(0);
    setStatus("loading");
    setRetryAttempts((attempts) => attempts + 1);
    // Yield to the browser so the button press and navigation remain responsive
    // before a slow WebView starts a new metadata request for the large MP3.
    retryTaskRef.current = window.setTimeout(() => {
      retryTaskRef.current = null;
      if (audioRef.current !== audio || sourceRef.current !== src) return;
      audio.load();
      startLoadingTimer();
      log("manual_retry");
    }, 0);
  }, [log, retryAttempts, src, startLoadingTimer]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, []);

  return { audioRef, status, currentTime, duration, buffered, failure, retryAttempts, togglePlayback, retry, seek, setVolume, log };
}
