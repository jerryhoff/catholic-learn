"use client";

import { useEffect, useState } from "react";
import { Phrase } from "@/lib/types";
import { usePlayer } from "@/hooks/use-player";
import { useMusic } from "@/hooks/use-music";
import { translateReference } from "@/lib/bible-books";
import {
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat,
  Music, VolumeX, BookOpen, Volume2,
} from "lucide-react";

export default function PlayerPage() {
  const [allPhrases, setAllPhrases] = useState<Phrase[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/phrases")
      .then((res) => res.json())
      .then(setAllPhrases);
  }, []);

  const {
    isPlaying, currentPhrase, currentIndex, currentLanguage, transitioning,
    toggle, skip, settings, setSettings, filteredPhrases,
  } = usePlayer(allPhrases, activeTag);

  const { skipTrack } = useMusic(settings.musicEnabled && isPlaying, settings.musicVolume);

  const subTags = Array.from(new Set(allPhrases.flatMap((p) => p.tags.filter((t) => t !== "catholic")))).sort();
  const totalWithAudio = filteredPhrases.length;

  useEffect(() => {
    setSettings((s) => ({ ...s, languages: ["italian", "english"], languageOrder: ["italian", "english"] }));
  }, [setSettings]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7rem)]">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-6 space-y-5">
        {currentPhrase ? (
          <div
            className={`space-y-5 transition-all duration-700 ease-in-out ${
              transitioning ? "opacity-0 blur-md scale-[0.97]" : "opacity-100 blur-0 scale-100"
            }`}
          >

            <div className="space-y-4 w-full">
              {currentPhrase.italian && (
                <div className={`transition-all duration-500 ${currentLanguage === "italian" ? "scale-105" : ""}`}>
                  <p className={`text-2xl leading-relaxed font-serif italic ${
                    currentLanguage === "italian" ? "shimmer-gold text-glow-gold" : "text-amber-400/80"
                  }`}>
                    &ldquo;{currentPhrase.italian.text}&rdquo;
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
              </div>

              <div className={`transition-all duration-500 ${currentLanguage === "english" ? "scale-105" : ""}`}>
                <p className={`text-lg leading-relaxed font-serif ${
                  currentLanguage === "english" ? "shimmer-silver text-glow-silver" : "text-amber-100/50"
                }`}>
                  &ldquo;{currentPhrase.english}&rdquo;
                </p>
              </div>
            </div>

            {currentPhrase.reference && (
              <div className="space-y-0.5">
                <p className="text-xs text-amber-400/50 font-serif italic tracking-wide">
                  {translateReference(currentPhrase.reference)}
                </p>
                <p className="text-[10px] text-amber-100/30 font-serif tracking-wide">
                  {currentPhrase.reference}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-amber-100/30 space-y-2">
            <BookOpen className="w-16 h-16 mx-auto opacity-20" />
            <p className="text-sm">
              {allPhrases.length === 0 ? "Loading verses..." : totalWithAudio === 0 ? "No audio available." : "No verses match this tag."}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 pb-2">
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setSettings((s) => ({ ...s, shuffle: !s.shuffle }))}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${settings.shuffle ? "text-amber-400" : "text-amber-100/20"}`}>
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={() => skip(-1)} className="p-3 rounded-full text-amber-100 active:scale-90 transition-all">
            <SkipBack className="w-7 h-7" />
          </button>
          <button onClick={toggle}
            className="w-16 h-16 rounded-full bg-amber-500 active:bg-amber-600 text-amber-950 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-amber-500/20">
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
          <button onClick={() => skip(1)} className="p-3 rounded-full text-amber-100 active:scale-90 transition-all">
            <SkipForward className="w-7 h-7" />
          </button>
          <button onClick={() => setSettings((s) => ({ ...s, continuous: !s.continuous }))}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${settings.continuous ? "text-amber-400" : "text-amber-100/20"}`}>
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          <button onClick={() => setSettings((s) => ({ ...s, musicEnabled: !s.musicEnabled }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 border ${
              settings.musicEnabled ? "text-amber-400 border-amber-500/20 bg-amber-500/10" : "text-amber-100/30 border-amber-500/10"
            }`}>
            {settings.musicEnabled ? <Music className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {settings.musicEnabled ? "Music On" : "Music Off"}
          </button>
          {settings.musicEnabled && (
            <button onClick={skipTrack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all active:scale-95 border text-amber-100/30 border-amber-500/10">
              <SkipForward className="w-3.5 h-3.5" />
              Next Song
            </button>
          )}
        </div>

        {subTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <button onClick={() => setActiveTag(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTag === null ? "bg-amber-500/20 text-amber-400 border border-amber-400/30" : "text-amber-100/30 border border-amber-500/10"
              }`}>
              All
            </button>
            {subTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTag === tag ? "bg-amber-500/20 text-amber-400 border border-amber-400/30" : "text-amber-100/30 border border-amber-500/10"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
