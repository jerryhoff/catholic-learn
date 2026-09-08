"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Phrase, Language, PlayerSettings } from "@/lib/types";

interface UsePlayerReturn {
  isPlaying: boolean;
  currentPhrase: Phrase | null;
  currentIndex: number;
  currentLanguage: Language | null;
  transitioning: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  skip: (direction: 1 | -1) => void;
  setSettings: (s: PlayerSettings | ((prev: PlayerSettings) => PlayerSettings)) => void;
  settings: PlayerSettings;
  filteredPhrases: Phrase[];
}

export function usePlayer(phrases: Phrase[], activeTag: string | null): UsePlayerReturn {
  const [settings, setSettings] = useState<PlayerSettings>({
    languages: ["japanese", "english"],
    languageOrder: ["japanese", "english"],
    pauseBetweenLanguages: 3,
    pauseBetweenPhrases: 3,
    shuffle: true,
    continuous: true,
    musicEnabled: true,
    musicVolume: 0.02,
    phraseVolume: 0.55,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const settingsRef = useRef(settings);

  // Keep refs in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const filteredPhrases = activeTag
    ? phrases.filter((p) => p.tags.includes(activeTag))
    : phrases;

  // Only phrases with audio ready
  const playablePhrases = filteredPhrases.filter((p) => p.audioStatus === "ready");

  const currentPhrase = playablePhrases[currentIndex] || null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, []);

  // Get audio URL for a phrase + language
  const getAudioUrl = useCallback((phrase: Phrase, lang: Language): string | null => {
    switch (lang) {
      case "english": return phrase.audio.english || null;
      case "japanese": return phrase.audio.japanese || null;
      case "italian": return phrase.audio.italian || null;
    }
  }, []);

  // Play a single audio file, returns a promise that resolves when done
  const playAudioFile = useCallback((url: string, volume: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        // Set up Web Audio API for volume control
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(gain);
        audioCtxRef.current = ctx;
        gainRef.current = gain;
      }
      const audio = audioRef.current;
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
      if (gainRef.current) {
        gainRef.current.gain.value = volume;
      }
      audio.src = url;

      const onEnded = () => {
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        reject(new Error("Audio playback error"));
      };

      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);
      audio.play().catch(reject);
    });
  }, []);

  // Wait for a duration, cancellable
  const wait = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      timerRef.current = setTimeout(resolve, ms);
    });
  }, []);

  // Play through one phrase (all selected languages with pauses)
  const playPhrase = useCallback(async (phrase: Phrase) => {
    const s = settingsRef.current;
    const langs = s.languages.filter((lang) => {
      const url = getAudioUrl(phrase, lang);
      return url != null;
    });

    for (let i = 0; i < langs.length; i++) {
      if (!isPlayingRef.current) return;

      const lang = langs[i];
      const url = getAudioUrl(phrase, lang);
      if (!url) continue;

      setCurrentLanguage(lang);

      try {
        await playAudioFile(url, s.phraseVolume);
      } catch {
        // Audio error, skip this language
        continue;
      }

      // Pause between languages (not after the last one)
      if (i < langs.length - 1 && isPlayingRef.current) {
        setCurrentLanguage(null);
        await wait(s.pauseBetweenLanguages * 1000);
      }
    }

    setCurrentLanguage(null);
  }, [getAudioUrl, playAudioFile, wait]);

  // Main playback loop
  const playLoop = useCallback(async (startIndex: number) => {
    let idx = startIndex;

    while (isPlayingRef.current) {
      const s = settingsRef.current;
      const available = playablePhrases;
      if (available.length === 0) {
        setIsPlaying(false);
        return;
      }

      // Clamp index
      idx = idx % available.length;

      // Set phrase (text updates while still blurred from previous cycle, or first phrase)
      setCurrentIndex(idx);

      // Blur in
      setTransitioning(false);
      await wait(800); // wait for blur-in to complete

      if (!isPlayingRef.current) return;

      // Play audio
      const phrase = available[idx];
      await playPhrase(phrase);

      if (!isPlayingRef.current) return;

      // Pause between phrases
      await wait(s.pauseBetweenPhrases * 1000);

      if (!isPlayingRef.current) return;

      // Blur out
      setTransitioning(true);
      await wait(600);

      if (!isPlayingRef.current) {
        setTransitioning(false);
        return;
      }

      // Next phrase
      if (s.shuffle) {
        idx = Math.floor(Math.random() * available.length);
      } else {
        idx = idx + 1;
        if (idx >= available.length) {
          if (s.continuous) {
            idx = 0;
          } else {
            setIsPlaying(false);
            return;
          }
        }
      }
    }
  }, [playablePhrases, playPhrase, wait]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    setTransitioning(false);
    clearTimer();
    stopAudio();
    setCurrentLanguage(null);
  }, [clearTimer, stopAudio]);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const skip = useCallback((direction: 1 | -1) => {
    clearTimer();
    stopAudio();
    const len = playablePhrases.length;
    if (len === 0) return;

    if (settings.shuffle) {
      setCurrentIndex(Math.floor(Math.random() * len));
    } else {
      setCurrentIndex((prev) => (prev + direction + len) % len);
    }
  }, [clearTimer, stopAudio, playablePhrases.length, settings.shuffle]);

  // Start/stop playback loop when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      playLoop(currentIndex);
    }
    return () => {
      clearTimer();
    };
    // Only trigger on isPlaying changes, not currentIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Listen for stop-player event (e.g., when navigating to verses)
  useEffect(() => {
    const handler = () => pause();
    window.addEventListener("stop-player", handler);
    return () => window.removeEventListener("stop-player", handler);
  }, [pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopAudio();
    };
  }, [clearTimer, stopAudio]);

  return {
    isPlaying,
    currentPhrase,
    currentIndex,
    currentLanguage,
    transitioning,
    play,
    pause,
    toggle,
    skip,
    setSettings,
    settings,
    filteredPhrases: playablePhrases,
  };
}
