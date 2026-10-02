"use client";

import { useCallback, useEffect, useState } from "react";
import { A } from "@/data/apology";

const TOTAL = 7;
const STEP = 0.75; // seconds between lines

function Lines({ lines, start = 0.2, big = false }: { lines: string[]; start?: number; big?: boolean }) {
  return (
    <div>
      {lines.map((l, i) => (
        <p
          key={i}
          className={`fade-up mb-5 whitespace-pre-line leading-relaxed text-white/85 ${big ? "text-xl" : "text-lg"}`}
          style={{ animationDelay: `${start + i * STEP}s` }}
        >
          {l}
        </p>
      ))}
    </div>
  );
}

function Btn({ label, onClick, delay }: { label: string; onClick: () => void; delay: number }) {
  return (
    <button
      onClick={onClick}
      className="btn fade-up mt-6 rounded-full px-7 py-3 text-base text-[#1a1020]"
      style={{ background: A.colors.accent, animationDelay: `${delay}s` }}
    >
      {label}
    </button>
  );
}

function Petals({ count }: { count: number }) {
  // deterministic values so server and client markup match
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${(i * 53 + 7) % 100}%`,
            width: 6 + ((i * 7) % 9),
            height: 6 + ((i * 7) % 9),
            animationDuration: `${16 + ((i * 5) % 12)}s`,
            animationDelay: `-${(i * 3) % 16}s`,
          }}
        />
      ))}
    </>
  );
}

function Speedometer() {
  const [v, setV] = useState<number>(A.fault.startSpeed);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + 1200;
    const dur = 5500;
    const tick = (now: number) => {
      const p = Math.min(Math.max((now - t0) / dur, 0), 1);
      setV(Math.round(A.fault.startSpeed * (1 - (1 - Math.pow(1 - p, 3)))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const angle = -90 + (v / 160) * 180;
  return (
    <div className="fade-up mx-auto mb-8 w-56" style={{ animationDelay: "0.3s" }}>
      <svg viewBox="0 0 200 125" className="w-full" aria-hidden="true">
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="6" strokeLinecap="round" />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 110px", transition: "transform .1s linear" }}>
          <line x1="100" y1="110" x2="100" y2="42" stroke="rgba(255,255,255,.8)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="110" r="6" fill="rgba(255,255,255,.8)" />
      </svg>
      <p className="-mt-1 text-center text-2xl tabular-nums text-white/70">
        {v} <span className="text-sm text-white/40">km/h</span>
      </p>
    </div>
  );
}

function CardStack({ onDone }: { onDone: () => void }) {
  const cards = A.sorryCards.cards;
  const [n, setN] = useState(1);
  const last = n === cards.length;
  return (
    <div>
      <div
        className="relative mx-auto h-72 w-full cursor-pointer select-none"
        onClick={() => !last && setN((x) => x + 1)}
        role="button"
        aria-label="next card"
      >
        {cards.slice(0, n).map((c, i) => {
          const depth = n - 1 - i;
          return (
            <div
              key={i}
              className={`glass absolute inset-0 flex items-center justify-center rounded-3xl p-7 text-center text-xl leading-relaxed ${depth === 0 ? "fade-up" : ""}`}
              style={{
                transform: `translateY(${-depth * 12}px) rotate(${(i % 2 ? 1 : -1) * depth * 2}deg) scale(${1 - depth * 0.04})`,
                opacity: depth > 3 ? 0 : 1 - depth * 0.2,
                transition: "all .5s ease",
                zIndex: i,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      {!last && <p className="mt-6 text-center text-sm text-white/40">{A.sorryCards.hint} · {n}/{cards.length}</p>}
      {last && <div className="text-center"><Btn label={A.sorryCards.button} onClick={onDone} delay={0.4} /></div>}
    </div>
  );
}

function Memory({ m, i }: { m: (typeof A.memories.items)[number]; i: number }) {
  const [broken, setBroken] = useState(false);
  const [straight, setStraight] = useState(false);
  const tints = ["#f2b8a2", "#c9a7ff", "#9fc5ff", "#ffd1a1", "#f7a8c4"];
  const showImg = m.image !== "" && !broken;
  return (
    <button
      onClick={() => setStraight((s) => !s)}
      className="glass btn fade-up block w-full rounded-3xl p-3 text-left transition-transform duration-500 hover:scale-[1.02]"
      style={{ animationDelay: `${0.4 + i * 0.3}s`, transform: straight ? "none" : `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}
    >
      <div
        className="aspect-[4/3] w-full overflow-hidden rounded-2xl"
        style={showImg ? undefined : { background: `linear-gradient(135deg, ${tints[i % tints.length]}38, rgba(255,255,255,0.02))` }}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.image} alt={m.caption} className="h-full w-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-xl leading-snug text-white/85">{m.caption}</div>
        )}
      </div>
      {showImg && <p className="mt-3 px-1 text-base text-white/85">{m.caption}</p>}
      {m.date && <p className="mt-2 px-1 text-xs text-white/40">{m.date}</p>}
    </button>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL - 1));
    window.scrollTo({ top: 0 });
  }, []);

  const c = A.colors;
  const serious = step === 2;
  const bgs = [
    `linear-gradient(135deg, ${c.nightA}, ${c.nightB}, ${c.nightC})`,
    `linear-gradient(135deg, #07090f, #121826, #1b1f2e)`,
    `linear-gradient(135deg, #1a0f1c, #3a1d33, #54283a)`,
  ];
  const bgIndex = done ? 2 : serious ? 1 : 0;

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="bg-layer" style={{ background: bgs[0], backgroundSize: "200% 200%" }} />
        <span className="h-3 w-3 animate-pulse rounded-full" style={{ background: c.accent }} />
      </main>
    );
  }

  const f = A.final;
  return (
    <>
      {bgs.map((b, i) => (
        <div key={i} className="bg-layer" style={{ background: b, backgroundSize: "200% 200%", opacity: bgIndex === i ? 1 : 0 }} />
      ))}
      <Petals count={done ? 28 : 12} />
      <div className="fixed left-0 top-0 z-20 h-[3px] w-full bg-white/5">
        <div className="h-full transition-all duration-700" style={{ width: `${done ? 100 : ((step + 1) / TOTAL) * 100}%`, background: c.accent }} />
      </div>

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
        {done ? (
          <section key="end" className="text-center">
            <p className="fade-up mb-6 text-2xl leading-relaxed" style={{ animationDelay: "1s" }}>{A.ending[0]}</p>
            <p className="fade-up text-xl text-white/80" style={{ animationDelay: "3s" }}>{A.ending[1]}</p>
          </section>
        ) : (
          <section key={step}>
            {step === 0 && (
              <>
                <p className="fade-up mb-4 text-sm text-white/50">{A.intro.small}</p>
                <h1 className="fade-up mb-8 text-4xl leading-tight" style={{ animationDelay: "0.6s" }}>{A.intro.heading}</h1>
                <Lines lines={A.intro.lines} start={1.6} />
                <Btn label={A.intro.button} onClick={next} delay={1.6 + A.intro.lines.length * STEP} />
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="fade-up mb-8 text-3xl leading-tight">{A.about.heading}</h2>
                <Lines lines={A.about.lines} start={0.8} />
                <Btn label={A.about.button} onClick={next} delay={0.8 + A.about.lines.length * STEP} />
              </>
            )}
            {step === 2 && (
              <>
                <Speedometer />
                <h2 className="fade-up mb-8 text-3xl leading-tight" style={{ animationDelay: "0.5s" }}>{A.fault.heading}</h2>
                <Lines lines={A.fault.lines} start={1.2} />
                <Btn label={A.fault.button} onClick={next} delay={1.2 + A.fault.lines.length * STEP} />
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="fade-up mb-8 text-center text-2xl text-white/80">{A.sorryCards.heading}</h2>
                <CardStack onDone={next} />
              </>
            )}
            {step === 4 && (
              <>
                <Lines lines={A.trust.lines} start={0.3} big />
                <Btn label={A.trust.button} onClick={next} delay={0.3 + A.trust.lines.length * STEP} />
              </>
            )}
            {step === 5 && (
              <>
                <h2 className="fade-up mb-3 text-3xl">{A.memories.heading}</h2>
                <p className="fade-up mb-8 text-base text-white/60" style={{ animationDelay: "0.2s" }}>{A.memories.sub}</p>
                <div className="space-y-5">
                  {A.memories.items.map((m, i) => <Memory key={i} m={m} i={i} />)}
                </div>
                <Btn label={A.memories.button} onClick={next} delay={0.4 + A.memories.items.length * 0.3} />
              </>
            )}
            {step === 6 && (
              <>
                <p className="fade-up mb-3 text-sm text-white/50">{f.small}</p>
                <h2 className="fade-up mb-10 text-4xl leading-tight" style={{ animationDelay: "0.5s" }}>{f.heading}</h2>
                <Lines lines={f.lines} start={1.4} />
                <p className="fade-up mt-2 text-sm text-white/45" style={{ animationDelay: `${1.4 + f.lines.length * STEP}s` }}>{A.signOff}</p>
                <Btn label={f.button} onClick={() => setDone(true)} delay={2 + f.lines.length * STEP} />
              </>
            )}
          </section>
        )}
      </main>
    </>
  );
}
