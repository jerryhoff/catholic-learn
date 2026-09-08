"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Headphones } from "lucide-react";
import { GoldenDust } from "@/components/golden-dust";

const navItems = [
  { href: "/player", label: "Listen", icon: Headphones },
  { href: "/verses", label: "Verses", icon: BookOpen },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-[100dvh] relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover"
        style={{ backgroundPosition: "60% center", backgroundImage: "url(/catholic_mockups/church.png)" }}
      />
      <div className="fixed inset-0 z-0 bg-black/70" />
      <GoldenDust />

      {/* Header */}
      <header className="relative z-10 border-b border-amber-500/10 bg-black/30 backdrop-blur-md sticky top-0 safe-top">
        <div className="px-4 h-12 flex items-center justify-center">
          <Link href="/" className="text-lg font-serif font-bold tracking-wide shimmer-gold-subtle">
            CatholicLearn
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="px-4 py-4 pb-2 max-w-lg mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="relative z-10 border-t border-amber-500/10 bg-black/30 backdrop-blur-md sticky bottom-0">
        <div className="flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (item.href === "/verses") {
                    window.dispatchEvent(new Event("stop-player"));
                  }
                }}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1 text-[10px] font-medium transition-colors active:scale-95",
                  isActive
                    ? "text-amber-400"
                    : "text-amber-100/40 active:text-amber-100"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
