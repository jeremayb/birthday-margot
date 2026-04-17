"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

interface Props {
  onNext: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  exploded: boolean;
  particles: Particle[];
  color: string;
  trailX: number[];
  trailY: number[];
}

const COLORS = [
  "#ff6b9d", "#c084fc", "#60a5fa", "#34d399", "#fbbf24",
  "#f87171", "#a78bfa", "#38bdf8", "#4ade80", "#fb923c",
];

export default function BirthdayScreen({ onNext }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const fireworksRef = useRef<Firework[]>([]);
  const lastFireworkRef = useRef<number>(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const stars = useRef(
    Array.from({ length: 60 }, () => ({
      w: 1 + Math.random() * 2,
      h: 1 + Math.random() * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 1.5 + Math.random() * 2,
    }))
  );

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
    };
    resize();
    window.addEventListener("resize", resize);

    function createParticles(x: number, y: number, color: string): Particle[] {
      const particles: Particle[] = [];
      const count = 80 + Math.random() * 40;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3,
          color,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.008,
          gravity: 0.08,
        });
      }
      return particles;
    }

    function spawnFirework() {
      const x = c.width * (0.2 + Math.random() * 0.6);
      const targetY = c.height * (0.1 + Math.random() * 0.4);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      fireworksRef.current.push({
        x,
        y: c.height,
        targetY,
        vy: -12 - Math.random() * 6,
        exploded: false,
        particles: [],
        color,
        trailX: [],
        trailY: [],
      });
    }

    function draw(now: number) {
      if (now - lastFireworkRef.current > 600) {
        spawnFirework();
        lastFireworkRef.current = now;
      }

      g.fillStyle = "rgba(0,0,0,0.15)";
      g.fillRect(0, 0, c.width, c.height);

      fireworksRef.current = fireworksRef.current.filter((fw) => {
        if (!fw.exploded) {
          fw.y += fw.vy;
          fw.vy += 0.3;
          fw.trailX.push(fw.x);
          fw.trailY.push(fw.y);
          if (fw.trailX.length > 8) {
            fw.trailX.shift();
            fw.trailY.shift();
          }

          g.beginPath();
          for (let i = 0; i < fw.trailX.length; i++) {
            const alpha = i / fw.trailX.length;
            g.globalAlpha = alpha * 0.7;
            if (i === 0) g.moveTo(fw.trailX[i], fw.trailY[i]);
            else g.lineTo(fw.trailX[i], fw.trailY[i]);
          }
          g.strokeStyle = fw.color;
          g.lineWidth = 2;
          g.stroke();
          g.globalAlpha = 1;

          if (fw.y <= fw.targetY) {
            fw.exploded = true;
            fw.particles = createParticles(fw.x, fw.y, fw.color);
            const secondColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            fw.particles.push(...createParticles(fw.x, fw.y, secondColor).slice(0, 30));
          }
          return true;
        }

        fw.particles = fw.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.99;
          p.alpha -= p.decay;

          if (p.alpha <= 0) return false;

          g.globalAlpha = p.alpha;
          g.beginPath();
          g.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          g.fillStyle = p.color;
          g.fill();
          g.globalAlpha = 1;
          return true;
        });

        return fw.particles.length > 0;
      });

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    const launchConfetti = () => {
      const end = Date.now() + 4000;
      const colors = ["#ff6b9d", "#c084fc", "#60a5fa", "#fbbf24", "#34d399"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    };

    launchConfetti();
    setMounted(true);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleNext = () => {
    setVisible(false);
    setTimeout(onNext, 600);
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #2d1b69 30%, #1e3a5f 70%, #0f1f3d 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease-out",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Stars background */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.current.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: `${s.w}px`,
                height: `${s.h}px`,
                left: `${s.left}%`,
                top: `${s.top}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <div
          className="animate-scale-in"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <p
            className="text-2xl mb-2 animate-float"
            style={{ fontFamily: "var(--font-space)" }}
          >
            🎉 ✨ 🎊
          </p>
        </div>

        <h1
          className="animate-scale-in"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2.2rem, 9vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            color: "transparent",
            background: "linear-gradient(135deg, #fbbf24, #f472b6, #c084fc, #60a5fa)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow: "none",
            animationDelay: "0.4s",
            opacity: 0,
            maxWidth: "340px",
          }}
        >
          Joyeux Anniversaire
        </h1>

        <h2
          className="animate-scale-in"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(3rem, 14vw, 6rem)",
            fontWeight: 900,
            fontStyle: "italic",
            color: "transparent",
            background: "linear-gradient(90deg, #fde68a, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            animationDelay: "0.7s",
            opacity: 0,
            textShadow: "none",
          }}
        >
          Margot
        </h2>

        <div
          className="animate-fade-in mt-4"
          style={{ animationDelay: "1.2s", opacity: 0 }}
        >
          <p className="text-3xl animate-float" style={{ animationDelay: "0.5s" }}>
            🥂🌟💜
          </p>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="absolute bottom-8 right-6 z-20 animate-fade-in"
        style={{
          animationDelay: "1.8s",
          opacity: 0,
          background: "linear-gradient(135deg, #7c3aed, #db2777)",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "14px 22px",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-space)",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.5)",
          letterSpacing: "0.02em",
          maxWidth: "200px",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        Mérites-tu ton cadeau ? 🎁
      </button>
    </div>
  );
}
