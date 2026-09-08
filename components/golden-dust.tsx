"use client";

import { useEffect, useRef } from "react";

export function GoldenDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    interface Particle {
      x: number;
      y: number;
      size: number;
      opacity: number;
      maxOpacity: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      phase: "in" | "hold" | "out";
      fadeInDuration: number;
      holdDuration: number;
      fadeOutDuration: number;
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0,
        maxOpacity: 0.15 + Math.random() * 0.25,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1, // slight upward drift
        life: 0,
        maxLife: 0,
        phase: "in",
        fadeInDuration: 60 + Math.random() * 90, // 1-2.5s at 60fps
        holdDuration: 60 + Math.random() * 120, // 1-3s
        fadeOutDuration: 60 + Math.random() * 90, // 1-2.5s
      };
    }

    // Start with a few
    for (let i = 0; i < 8; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.fadeInDuration; // stagger
      particles.push(p);
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn new particles occasionally
      if (particles.length < 25 && Math.random() < 0.03) {
        particles.push(spawnParticle());
      }

      particles = particles.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Slight wandering
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
        // Dampen
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Phase transitions
        if (p.phase === "in") {
          p.opacity = (p.life / p.fadeInDuration) * p.maxOpacity;
          if (p.life >= p.fadeInDuration) {
            p.phase = "hold";
            p.life = 0;
          }
        } else if (p.phase === "hold") {
          p.opacity = p.maxOpacity;
          if (p.life >= p.holdDuration) {
            p.phase = "out";
            p.life = 0;
          }
        } else {
          p.opacity = (1 - p.life / p.fadeOutDuration) * p.maxOpacity;
          if (p.life >= p.fadeOutDuration) {
            return false; // remove
          }
        }

        // Draw
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 215, 100, ${Math.max(0, p.opacity)})`;
        ctx!.fill();

        return true;
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
