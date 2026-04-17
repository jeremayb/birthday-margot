"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onSuccess: () => void;
}

const CHARADE_CLUES = [
  { num: "1er", syllable: "ob", clue: "Presque un Bob... indice : Sebastien l'est" },
  { num: "2e", syllable: "ser", clue: "Les doigts des oiseaux" },
  { num: "3e", syllable: "vat", clue: "Trèèès étendu" },
  { num: "4e", syllable: "ion", clue: "Pas tout à fait un atome (oui, jsuis prof de physique)" },
  { num: "5e", syllable: "as", clue: "Je bats les autres au poker !" },
  { num: "6e", syllable: "tro", clue: "Allure de cheval" },
  { num: "7e", syllable: "No", clue: "Style traditionnel du théâtre japonais (mots croisés gang)" },
  { num: "8e", syllable: "mique", clue: "Une mite... la bouche pleine" },
];

const LUGUBRIOUS_MESSAGES = [
  "Les ombres ricanent de ta tentative...",
  "Même les étoiles se détournent de toi ce soir.",
  "La nuit murmure : essaie encore, pauvre âme.",
  "Ton destin se referme comme un tombeau.",
  "Les corbeaux ont ri. Tu as raté.",
  "L'univers pleure. Tu es si proche... et si loin.",
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const CORRECT_ANSWER = "observation astronomique";

export default function CharadeScreen({ onSuccess }: Props) {
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      w: 1 + Math.random() * 1.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 3,
    }))
  );

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = () => {
    if (normalize(input) === normalize(CORRECT_ANSWER)) {
      setVisible(false);
      setTimeout(onSuccess, 700);
    } else {
      const msg = LUGUBRIOUS_MESSAGES[Math.floor(Math.random() * LUGUBRIOUS_MESSAGES.length)];
      setErrorMsg(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="relative w-full min-h-full flex items-center justify-center overflow-auto"
      style={{
        background: "radial-gradient(ellipse at top, #0d0d1a 0%, #050508 60%, #000000 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease-out",
        padding: "2rem",
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* Floating dark particles */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.current.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-twinkle"
              style={{
                width: `${p.w}px`,
                height: `${p.w}px`,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: "rgba(147, 51, 234, 0.4)",
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col px-5 py-8 gap-6 max-w-lg mx-auto w-full my-auto">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <p className="text-purple-400 text-sm tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "var(--font-space)" }}>
            ✦ épreuve ✦
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 8vw, 3rem)",
              fontWeight: 700,
              color: "#e2e8f0",
              textShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
            }}
          >
            La Charade
          </h1>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-purple-800 to-transparent" />
        </div>

        {/* Clues */}
        <div className="flex flex-col gap-3">
          {CHARADE_CLUES.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg p-3 animate-fade-in-up"
              style={{
                background: "rgba(15, 15, 30, 0.8)",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                animationDelay: `${0.3 + i * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="flex flex-col items-center min-w-[48px]">
                <span
                  className="text-purple-400 text-xs font-semibold "
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  Mon {item.num}
                </span>
              </div>
              <div className="flex-1 border-l border-gray-700 pl-3">
                <p
                  className="text-gray-300 text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  {item.clue}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Answer input */}
        <div
          className="flex flex-col gap-3 animate-fade-in"
          style={{ animationDelay: "1.1s", opacity: 0 }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <p
            className="text-gray-400 text-xs text-center tracking-wide"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Ta réponse, si tu l'oses...
          </p>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setErrorMsg("");
            }}
            onKeyDown={handleKey}
            placeholder="Ta réponse si tu l'oses"
            className="w-full rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none"
            style={{
              background: "rgba(10, 10, 20, 0.9)",
              border: "1px solid rgba(107, 33, 168, 0.5)",
              fontFamily: "var(--font-space)",
              fontSize: "1rem",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(167, 139, 250, 0.8)";
              e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 15px rgba(107,33,168,0.3)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(107, 33, 168, 0.5)";
              e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.5)";
            }}
          />

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
              fontFamily: "var(--font-space)",
              fontSize: "0.95rem",
              letterSpacing: "0.05em",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
            }}
          >
            Révéler mon sort ✦
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            className={`text-center px-4 py-3 rounded-lg ${shaking ? "animate-shake" : ""}`}
            style={{
              background: "rgba(30, 5, 5, 0.8)",
              border: "1px solid rgba(153, 27, 27, 0.5)",
              color: "#fca5a5",
              fontFamily: "var(--font-playfair)",
              fontSize: "0.95rem",
              fontStyle: "italic",
              textShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
            }}
          >
            ☽ {errorMsg} ☾
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
