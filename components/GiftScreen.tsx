"use client";

import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

export default function GiftScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = canvas;
    const g = ctx;

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      initStars();
    };

    function initStars() {
      const stars: Star[] = [];
      for (let i = 0; i < 250; i++) {
        stars.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          z: Math.random(),
          size: 0.3 + Math.random() * 2.2,
          brightness: 0.4 + Math.random() * 0.6,
          twinkleSpeed: 0.5 + Math.random() * 1.5,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;

      const shooting: ShootingStar[] = [];
      for (let i = 0; i < 5; i++) {
        shooting.push(createShootingStar(c.width, c.height));
      }
      shootingStarsRef.current = shooting;
    }

    function createShootingStar(w: number, h: number): ShootingStar {
      return {
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        length: 80 + Math.random() * 120,
        speed: 4 + Math.random() * 5,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
        alpha: 0,
        active: false,
      };
    }

    resize();
    window.addEventListener("resize", resize);

    let lastShoot = 0;
    let t = 0;

    function draw(now: number) {
      t = now * 0.001;
      g.fillStyle = "rgba(1, 2, 12, 0.2)";
      g.fillRect(0, 0, c.width, c.height);

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * (0.6 + twinkle * 0.4);
        const size = star.size * (0.85 + twinkle * 0.15);

        g.globalAlpha = alpha;
        if (star.z > 0.8) g.fillStyle = "#ffe4a0";
        else if (star.z > 0.6) g.fillStyle = "#c8d8ff";
        else g.fillStyle = "#ffffff";

        g.beginPath();
        g.arc(star.x, star.y, size, 0, Math.PI * 2);
        g.fill();

        if (star.brightness > 0.85 && size > 1.5) {
          g.globalAlpha = alpha * 0.15;
          g.beginPath();
          g.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
          g.fill();
        }
      });

      if (now - lastShoot > 2500 + Math.random() * 2000) {
        const idx = shootingStarsRef.current.findIndex((s) => !s.active);
        if (idx !== -1) {
          const s = shootingStarsRef.current[idx];
          s.x = Math.random() * c.width;
          s.y = Math.random() * c.height * 0.4;
          s.alpha = 1;
          s.active = true;
        }
        lastShoot = now;
      }

      shootingStarsRef.current.forEach((s) => {
        if (!s.active) return;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.015;

        if (s.alpha <= 0) {
          s.active = false;
          return;
        }

        const grad = g.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length
        );
        grad.addColorStop(0, `rgba(255, 255, 240, ${s.alpha})`);
        grad.addColorStop(1, "rgba(255, 255, 240, 0)");

        g.globalAlpha = 1;
        g.strokeStyle = grad;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(s.x, s.y);
        g.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
        g.stroke();
      });

      g.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    // Reveal text after a short delay
    const revealTimer = setTimeout(() => setRevealed(true), 400);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: "#01020c" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Nebula glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 40%, rgba(88, 28, 135, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(30, 58, 138, 0.10) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1.2s ease-out, transform 1.2s ease-out",
        }}
      >
        {/* Stars decoration */}
        <div className="flex gap-3 text-2xl animate-float">
          <span>✦</span>
          <span style={{ animationDelay: "0.5s" }}>★</span>
          <span style={{ animationDelay: "1s" }}>✦</span>
        </div>

        <div className="flex flex-col gap-5">
          <div className="text-center">
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(2rem, 9vw, 3.5rem)",
                fontWeight: 700,
                fontStyle: "italic",
                color: "#fde68a",
                textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
              }}
            >
              Bravo !
            </p>
            <p
              className="text-amber-300 text-xs tracking-[0.4em] uppercase mt-2"
              style={{ fontFamily: "var(--font-space)" }}
            >
              Ton cadeau
            </p>
          </div>
          <div
            className="rounded-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(251, 191, 36, 0.25)",
              boxShadow: "0 0 40px rgba(251, 191, 36, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              padding: "2rem",
            }}
          >
            <div className="text-4xl mb-4">🔭</div>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(1.6rem, 7vw, 2.8rem)",
                fontWeight: 700,
                color: "#fde68a",
                textShadow: "0 0 30px rgba(251, 191, 36, 0.4)",
                lineHeight: 1.25,
              }}
            >
              Un bon pour une<br />observation des étoiles
            </h2>
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent opacity-50" />
            <p
              style={{
                fontFamily: "var(--font-space)",
                fontSize: "clamp(1rem, 4vw, 1.3rem)",
                color: "#e2e8f0",
                letterSpacing: "0.05em",
              }}
            >
              pour deux personnes
            </p>
          </div>
        </div>

        <p
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(148, 163, 184, 0.8)",
            maxWidth: "280px",
            lineHeight: 1.6,
          }}
        >
          Parce que les plus belles choses<br />se contemplent la nuit... ✨
        </p>

        <div className="flex gap-4 text-xl animate-float" style={{ animationDelay: "1s" }}>
          <span>🌙</span>
          <span>⭐</span>
          <span>🌟</span>
          <span>⭐</span>
          <span>🌙</span>
        </div>
      </div>
    </div>
  );
}
