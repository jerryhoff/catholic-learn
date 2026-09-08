"use client";

import { useEffect, useRef, useCallback } from "react";

const TRACKS = [
  "/music/catholicrelax-adoration-in-quiet-stones-469602.mp3",
  "/music/catholicrelax-annunciation-light-465256.mp3",
  "/music/catholicrelax-ave-maria-gratia-plena-472895.mp3",
  "/music/catholicrelax-even-breath-466145.mp3",
  "/music/catholicrelax-gentle-flow-of-merciful-waters-466082.mp3",
  "/music/catholicrelax-little-boat-into-silence-4-471290.mp3",
  "/music/catholicrelax-oratio-sanctissimi-domini-nostri-479982.mp3",
  "/music/catholicrelax-quiet-boat-to-silence-471287.mp3",
  "/music/catholicrelax-quiet-refuge-in-his-presence-465257.mp3",
  "/music/catholicrelax-regina-cli-ltare-alleluia-472901.mp3",
  "/music/catholicrelax-relaxing-solo-piano-calm-ambient-music-for-study-amp-sleep-462679.mp3",
  "/music/catholicrelax-serene-reflections-462683.mp3",
  "/music/catholicrelax-still-lake-at-dusk-462708.mp3",
  "/music/catholicrelax-whispers-of-tranquility-462685.mp3",
  "/music/nickpanek-gregorian-chant-private-prayer-to-mary-337672.mp3",
];

// Module-level singletons
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

  const skipTrack = useCallback(() => {
    init();
    trackIndex = (trackIndex + 1) % TRACKS.length;
    audioEl!.src = TRACKS[trackIndex];
    if (gainNode) gainNode.gain.value = volume;
    if (audioCtx?.state === "suspended") audioCtx.resume();
    audioEl!.play().catch(() => {});
  }, [volume]);

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

  return { skipTrack };
}
