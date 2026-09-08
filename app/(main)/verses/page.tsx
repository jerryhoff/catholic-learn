"use client";

import { useEffect, useState } from "react";
import { Phrase } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { translateReference } from "@/lib/bible-books";

export default function VersesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/phrases")
      .then((res) => res.json())
      .then((data) => { setPhrases(data); setLoading(false); });
  }, []);

  const filtered = phrases.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.english.toLowerCase().includes(q) || p.italian?.text?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-amber-100/40">Loading...</div></div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-100/30" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search verses..."
          className="pl-9 h-10 rounded-xl bg-black/30 border-amber-500/10 text-sm text-amber-100 placeholder:text-amber-100/30 backdrop-blur-sm" />
      </div>

      <p className="text-xs text-amber-100/30">{filtered.length} verse{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-amber-100/30 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto opacity-20" /><p className="text-sm">No verses found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((phrase) => (
            <div key={phrase.id} className="bg-black/30 backdrop-blur-sm border border-amber-500/10 rounded-2xl px-4 py-4">
              <p className="text-amber-100/90 text-[15px] leading-relaxed font-serif">&ldquo;{phrase.english}&rdquo;</p>
              {phrase.italian && (
                <p className="text-amber-400/70 text-[14px] mt-2.5 leading-relaxed italic font-serif">&ldquo;{phrase.italian.text}&rdquo;</p>
              )}
              <div className="flex items-center flex-wrap gap-1 mt-2.5">
                {phrase.reference && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400/50 border border-amber-500/15 font-serif italic">
                    {translateReference(phrase.reference)} · {phrase.reference}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
