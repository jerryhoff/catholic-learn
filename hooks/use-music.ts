"use client";

import { useEffect, useRef } from "react";

const TRACKS = [
  "/music/guitar1.mp3",
  "/music/guitar2.mp3",
  "/music/guitar3.mp3",
  "/music/guitar4.mp3",
];

// Module-level singletons so React strict mode doesn't duplicate
let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let audioEl: HTMLAudioElement | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let trackIndex = Math.floor(Math.random() * TRACKS.length);

function init() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  audioEl = new Audio();
  sourceNode = audioCtx.createMediaElementSource(audioEl);
  sourceNode.connect(gainNode);

  audioEl.addEventListener("ended", () => {
    trackIndex = (trackIndex + 1) % TRACKS.length;
    audioEl!.src = TRACKS[trackIndex];
    audioEl!.play().catch(() => {});
  });
}

export function useMusic(enabled: boolean, volume: number) {
  const prevEnabled = useRef(false);

  useEffect(() => {
    init();
    gainNode!.gain.value = volume;

    if (enabled && !prevEnabled.current) {
      if (audioCtx!.state === "suspended") audioCtx!.resume();
      if (!audioEl!.src) {
        audioEl!.src = TRACKS[trackIndex];
      }
      audioEl!.play().catch(() => {});
    } else if (!enabled && prevEnabled.current) {
      audioEl!.pause();
    }

    prevEnabled.current = enabled;
  }, [enabled, volume]);
}
