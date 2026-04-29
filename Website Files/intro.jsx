/* global React, ReactDOM, Stage, Sprite, useTime, useSprite, useTimeline, Easing, interpolate, animate, clamp */
const { useMemo } = React;

// ─── Brand tokens ─────────────────────────────────────
const BG       = "#0d0d0d";
const ACCENT   = "#a3e635";       // lime
const ACCENT_2 = "#c4ff4d";       // brighter lime for glow
const W = 1920, H = 1080;
const DUR = 8;

// ─── Logo mark — geometric NN built from grid ────────
// Two interlocking N letterforms made from rectangles, with arrow-up motif
// inspired by the user's logo (chart bars + rising arrow).
function LogoMark({ size = 280, reveal = 1, dotReveal = 0, glow = 0 }) {
  // reveal 0..1 — strokes draw in from grid; we animate stroke-dashoffset.
  const stroke = 14;
  const innerPad = 18;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <filter id="lgGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={3 + glow * 8} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer square frame */}
      <rect
        x="6" y="6" width="188" height="188"
        rx="2" ry="2"
        fill="none" stroke="#fff" strokeWidth="6"
        strokeDasharray="752"
        strokeDashoffset={(1 - clamp(reveal * 1.4, 0, 1)) * 752}
      />

      {/* 3 ascending bars (chart) */}
      {[
        { x: 36, y: 130, h: 50 },
        { x: 78, y: 100, h: 80 },
        { x: 120, y: 70,  h: 110 },
      ].map((b, i) => {
        const r = clamp((reveal - 0.15 - i * 0.08) * 3, 0, 1);
        return (
          <rect
            key={i}
            x={b.x} y={b.y + b.h * (1 - r)}
            width="22" height={b.h * r}
            fill="#fff"
          />
        );
      })}

      {/* Rising arrow */}
      <g filter="url(#lgGlow)">
        <path
          d={`M 30 160 L 160 40`}
          stroke={ACCENT}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="200"
          strokeDashoffset={(1 - clamp((reveal - 0.4) * 2, 0, 1)) * 200}
        />
        <path
          d="M 160 40 L 130 40 M 160 40 L 160 70"
          stroke={ACCENT}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="60"
          strokeDashoffset={(1 - clamp((reveal - 0.7) * 4, 0, 1)) * 60}
        />
      </g>

      {/* Accent dot top-right */}
      <circle
        cx="180" cy="20" r="6"
        fill={ACCENT_2}
        opacity={dotReveal}
        filter="url(#lgGlow)"
      >
      </circle>
    </svg>
  );
}

// ─── Grid layer ──────────────────────────────────────
function Grid({ opacity = 0.18, columns = 24, rows = 14, drawn = 1, vanish = 0 }) {
  // drawn = 0..1 — vertical lines draw from top, horizontal from left
  const verticals = [];
  const horizontals = [];
  for (let i = 1; i < columns; i++) {
    const x = (W / columns) * i;
    const local = clamp((drawn - i / columns) * 4, 0, 1);
    verticals.push(
      <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H * local} stroke="#a3e635" strokeWidth="1" opacity={0.55} />
    );
  }
  for (let j = 1; j < rows; j++) {
    const y = (H / rows) * j;
    const local = clamp((drawn - j / rows) * 4, 0, 1);
    horizontals.push(
      <line key={`h${j}`} x1={0} y1={y} x2={W * local} y2={y} stroke="#a3e635" strokeWidth="1" opacity={0.55} />
    );
  }
  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", inset: 0, opacity: opacity * (1 - vanish), mixBlendMode: "screen" }}
    >
      {verticals}
      {horizontals}
    </svg>
  );
}

// ─── Vertical light beams (parallax) ─────────────────
function LightBeams({ progress }) {
  // 8 vertical beams sweeping left-to-right slowly
  const beams = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        baseX: -0.2 + i * 0.18,
        width: 80 + Math.random() * 220,
        speed: 0.6 + Math.random() * 0.8,
        opacity: 0.08 + Math.random() * 0.18,
        hueShift: Math.random() * 8 - 4,
      });
    }
    return arr;
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", mixBlendMode: "screen" }}>
      {beams.map((b, i) => {
        const x = ((b.baseX + progress * b.speed) % 1.2) * W - b.width / 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -50, bottom: -50,
              left: x,
              width: b.width,
              background: `linear-gradient(90deg, transparent 0%, rgba(163, 230, 53, ${b.opacity}) 50%, transparent 100%)`,
              filter: "blur(20px)",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Drifting particles ──────────────────────────────
function Particles({ count = 60, time }) {
  const items = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * W,
        baseY: Math.random() * H,
        speed: 30 + Math.random() * 80,
        size: 1 + Math.random() * 2.5,
        op: 0.3 + Math.random() * 0.6,
        sway: 8 + Math.random() * 24,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {items.map((p, i) => {
        const y = ((p.baseY - time * p.speed) % H + H) % H;
        const x = p.x + Math.sin(time * 0.6 + p.phase) * p.sway;
        return (
          <circle key={i} cx={x} cy={y} r={p.size} fill={ACCENT} opacity={p.op} />
        );
      })}
    </svg>
  );
}

// ─── Scene 1: Data stream (0–3s) ─────────────────────
function Scene1() {
  const { localTime, progress, duration } = useSprite();
  // Fade out near end of scene to motion-cut
  const exit = clamp((localTime - (duration - 0.35)) / 0.35, 0, 1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit }}>
      <LightBeams progress={progress} />
      <Grid opacity={0.32} drawn={clamp(progress * 1.6, 0, 1)} />
      <Particles count={70} time={localTime} />
      {/* Cold radial center vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(163,230,53,0.06) 0%, transparent 65%)",
        mixBlendMode: "screen",
      }} />
    </div>
  );
}

// ─── Scene 2: Skyline at hyperspeed (3–6s) ───────────
function BuildingRow({ seed, baseY, scale, speed, time, opacity, glowEdges }) {
  // Procedural city silhouette — a series of rectangles
  const blocks = useMemo(() => {
    const arr = [];
    let x = 0;
    let s = seed;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const totalWidth = W * 3;
    while (x < totalWidth) {
      const w = (40 + rng() * 140) * scale;
      const h = (80 + rng() * 360) * scale;
      const slim = rng() > 0.7;
      const finalW = slim ? w * 0.4 : w;
      arr.push({ x, w: finalW, h, hasAntenna: rng() > 0.7, windowSeed: rng() });
      x += finalW + (4 + rng() * 14) * scale;
    }
    return arr;
  }, [seed, scale]);

  const totalWidth = W * 3;
  // Motion: scroll right-to-left
  const offset = (time * speed) % totalWidth;

  return (
    <div style={{
      position: "absolute",
      left: 0, right: 0,
      bottom: baseY,
      height: 600 * scale,
      opacity,
    }}>
      <svg
        width={totalWidth}
        height={600 * scale}
        style={{
          position: "absolute",
          left: -offset,
          bottom: 0,
          overflow: "visible",
        }}
      >
        {/* Render twice for seamless loop */}
        {[0, totalWidth].map((shift, k) => (
          <g key={k} transform={`translate(${shift}, 0)`}>
            {blocks.map((b, i) => {
              const top = 600 * scale - b.h;
              return (
                <g key={i}>
                  <rect
                    x={b.x} y={top}
                    width={b.w} height={b.h}
                    fill="#000"
                  />
                  {/* Top edge glow rim */}
                  {glowEdges && (
                    <rect
                      x={b.x} y={top - 2}
                      width={b.w} height="2"
                      fill={ACCENT}
                      opacity="0.85"
                      style={{ filter: `drop-shadow(0 0 8px ${ACCENT}) drop-shadow(0 0 16px ${ACCENT})` }}
                    />
                  )}
                  {/* Right edge glow rim (motion direction) */}
                  {glowEdges && (
                    <rect
                      x={b.x + b.w - 1} y={top}
                      width="1.5" height={b.h * 0.9}
                      fill={ACCENT}
                      opacity="0.55"
                      style={{ filter: `drop-shadow(0 0 4px ${ACCENT})` }}
                    />
                  )}
                  {/* Tiny windows */}
                  {Array.from({ length: Math.floor(b.h / 28) }).map((_, j) => {
                    if ((b.windowSeed + j * 0.37) % 1 > 0.55) return null;
                    const wy = top + 14 + j * 28;
                    return (
                      <rect
                        key={j}
                        x={b.x + b.w * 0.25} y={wy}
                        width={b.w * 0.15} height="3"
                        fill={ACCENT}
                        opacity="0.4"
                      />
                    );
                  })}
                  {/* Antenna */}
                  {b.hasAntenna && (
                    <line
                      x1={b.x + b.w / 2} y1={top}
                      x2={b.x + b.w / 2} y2={top - 30 * scale}
                      stroke="#000" strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

function SpeedLines({ time, progress }) {
  // Horizontal streak lines crossing frame
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        y: Math.random() * H,
        len: 200 + Math.random() * 600,
        speed: 1800 + Math.random() * 2400,
        opacity: 0.3 + Math.random() * 0.5,
        thickness: 1 + Math.random() * 1.5,
        offset: Math.random() * W * 2,
      });
    }
    return arr;
  }, []);

  // Fade in/out across scene
  const fade = Math.sin(progress * Math.PI); // peak at middle

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      {lines.map((l, i) => {
        const x = ((l.offset - time * l.speed) % (W + l.len + 200) + (W + l.len + 200)) % (W + l.len + 200) - l.len;
        return (
          <line
            key={i}
            x1={x} y1={l.y}
            x2={x + l.len} y2={l.y}
            stroke={ACCENT}
            strokeWidth={l.thickness}
            opacity={l.opacity * fade}
            style={{ filter: `drop-shadow(0 0 4px ${ACCENT})` }}
          />
        );
      })}
    </svg>
  );
}

function Scene2() {
  const { localTime, progress, duration } = useSprite();
  const entry = clamp(localTime / 0.4, 0, 1);
  const exit = clamp((localTime - (duration - 0.4)) / 0.4, 0, 1);
  const opacity = entry * (1 - exit);

  return (
    <div style={{ position: "absolute", inset: 0, opacity, background: BG }}>
      {/* Faint persistent grid */}
      <Grid opacity={0.10} drawn={1} />

      {/* Sky gradient hint */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(163,230,53,0.04) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.4) 100%)",
      }} />

      {/* Far skyline */}
      <BuildingRow seed={11} baseY={120} scale={0.55} speed={350} time={localTime} opacity={0.55} glowEdges={false} />
      {/* Mid skyline */}
      <BuildingRow seed={29} baseY={60}  scale={0.85} speed={700} time={localTime} opacity={0.9}  glowEdges={true} />
      {/* Near skyline (largest, fastest) */}
      <BuildingRow seed={47} baseY={0}   scale={1.25} speed={1300} time={localTime} opacity={1}    glowEdges={true} />

      {/* Speed lines on top */}
      <SpeedLines time={localTime} progress={progress} />

      {/* Foreground motion-blur darken band at edges */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }} />

      {/* Color grade — deep contrast */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)",
        mixBlendMode: "multiply",
      }} />
    </div>
  );
}

// ─── Scene 3: Logo bloom (6–8.5s) ────────────────────
function Scene3() {
  const { localTime, progress, duration } = useSprite();
  // Grid intersections converge → logo
  const reveal = clamp((localTime - 0.1) / 1.2, 0, 1);
  const dotReveal = clamp((localTime - 1.3) / 0.4, 0, 1);
  const wordReveal = clamp((localTime - 1.5) / 0.5, 0, 1);
  const subReveal  = clamp((localTime - 1.8) / 0.5, 0, 1);
  const exit = clamp((localTime - (duration - 0.3)) / 0.3, 0, 1);
  const opacity = 1 - exit;

  // Radial bloom intensity
  const bloom = Math.sin(clamp(localTime / duration, 0, 1) * Math.PI) * 0.7 + 0.3;

  return (
    <div style={{ position: "absolute", inset: 0, opacity, background: BG }}>
      {/* Grid stays */}
      <Grid opacity={0.18} drawn={1} />

      {/* Lines converging to center — animated guides */}
      <ConvergingLines progress={reveal} />

      {/* Radial bloom behind logo */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: 900, height: 900,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, rgba(163,230,53,${0.18 * bloom}) 0%, rgba(163,230,53,${0.06 * bloom}) 30%, transparent 60%)`,
        filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      {/* Logo + word stack */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}>
        <LogoMark size={300} reveal={reveal} dotReveal={dotReveal} glow={1} />

        <div style={{
          fontFamily: "'Syne', 'Inter', sans-serif",
          fontWeight: 800,
          fontSize: 84,
          letterSpacing: "0.06em",
          color: "#fff",
          opacity: wordReveal,
          transform: `translateY(${(1 - wordReveal) * 16}px)`,
          textTransform: "uppercase",
        }}>
          <span>Neon</span>{" "}
          <span style={{ color: ACCENT, textShadow: `0 0 30px ${ACCENT}` }}>Narrative</span>
        </div>

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "0.32em",
          color: "rgba(255,255,255,0.7)",
          opacity: subReveal,
          transform: `translateY(${(1 - subReveal) * 10}px)`,
          textTransform: "uppercase",
        }}>
          AI Operations &nbsp;·&nbsp; Digital Growth
        </div>
      </div>
    </div>
  );
}

function ConvergingLines({ progress }) {
  // Lines that appear to fly inward from grid intersections to center
  const lines = useMemo(() => {
    const arr = [];
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 600 + Math.random() * 300;
      arr.push({
        x1: cx + Math.cos(angle) * r,
        y1: cy + Math.sin(angle) * r,
        cx, cy,
        delay: Math.random() * 0.3,
      });
    }
    return arr;
  }, []);

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {lines.map((l, i) => {
        const p = clamp((progress - l.delay) * 2, 0, 1);
        const eased = Easing.easeInOutCubic(p);
        const fade = p < 0.5 ? p * 2 : (1 - (p - 0.5) * 2);
        const x = l.x1 + (l.cx - l.x1) * eased;
        const y = l.y1 + (l.cy - l.y1) * eased;
        return (
          <line
            key={i}
            x1={l.x1} y1={l.y1}
            x2={x} y2={y}
            stroke={ACCENT}
            strokeWidth="1.5"
            opacity={fade * 0.7}
            style={{ filter: `drop-shadow(0 0 4px ${ACCENT})` }}
          />
        );
      })}
    </svg>
  );
}

// ─── Scene 4: Hold + final hero composition (8.5–10s) ─
function Scene4() {
  const { localTime, duration } = useSprite();
  // Crossfade from centered logo (Scene3 final state) into hero layout
  // Scene 4 (3s): logo bloom centered first, then settles to hero composition.
  // 0.0–1.4s: logo assembles centered, grid locked
  // 1.4–3.0s: logo slides right, hero text reveals on left
  const logoReveal     = clamp(localTime / 1.0, 0, 1);            // logo strokes draw in
  const dotReveal      = clamp((localTime - 0.8) / 0.4, 0, 1);    // accent dot pulse
  const wordReveal     = clamp((localTime - 1.0) / 0.4, 0, 1);    // "Neon Narrative" word
  const subTagReveal   = clamp((localTime - 1.2) / 0.3, 0, 1);    // small caps subtitle
  const layoutProgress = clamp((localTime - 1.5) / 0.7, 0, 1);    // shift to two-column
  const heroTextReveal = clamp((localTime - 1.8) / 0.5, 0, 1);    // hero headline
  const heroSubReveal  = clamp((localTime - 2.1) / 0.4, 0, 1);
  const heroCtaReveal  = clamp((localTime - 2.4) / 0.4, 0, 1);

  // Logo position: starts centered, slides to right column
  const ease = Easing.easeInOutCubic(layoutProgress);
  // Centered: x=W/2. Right column: pushed further right to clear the bold headline.
  const logoX = W / 2 + (W * 0.86 - W / 2) * ease;
  const logoScale = 1 - 0.35 * ease; // shrink from 1 to ~0.65

  return (
    <div style={{ position: "absolute", inset: 0, background: BG }}>
      <Grid opacity={0.14} drawn={1} />

      {/* Hero left column — text reveals after layout starts shifting */}
      <div style={{
        position: "absolute",
        left: "8%",
        top: "50%",
        transform: `translateY(-50%)`,
        maxWidth: 720,
        opacity: layoutProgress,
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: ACCENT,
          marginBottom: 28,
          opacity: heroTextReveal,
          transform: `translateY(${(1 - heroTextReveal) * 14}px)`,
        }}>
          AI Operations &amp; Digital Growth
        </div>

        {/* Headline — bold white */}
        <h1 style={{
          fontFamily: "'Syne', 'Inter', sans-serif",
          fontWeight: 800,
          fontSize: 124,
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          color: "#ffffff",
          margin: 0,
          opacity: heroTextReveal,
          transform: `translateY(${(1 - heroTextReveal) * 22}px)`,
        }}>
          Where Strategy<br />Meets Automation.
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.78)",
          marginTop: 32,
          maxWidth: 600,
          opacity: heroSubReveal,
          transform: `translateY(${(1 - heroSubReveal) * 14}px)`,
        }}>
          Growth isn't a marketing problem. It's a systems problem. We fix both.
        </p>

        {/* CTA */}
        <div style={{
          marginTop: 44,
          display: "flex",
          gap: 16,
          opacity: heroCtaReveal,
          transform: `translateY(${(1 - heroCtaReveal) * 12}px)`,
        }}>
          <div style={{
            background: ACCENT,
            color: "#0d0d0d",
            padding: "16px 32px",
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.01em",
            boxShadow: `0 8px 30px rgba(163,230,53,0.35)`,
          }}>
            See What's Possible
          </div>
          <div style={{
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            padding: "16px 32px",
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.01em",
          }}>
            How It Works
          </div>
        </div>
      </div>

      {/* Logo — animates from center to right column */}
      <div style={{
        position: "absolute",
        left: logoX,
        top: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <LogoMark size={300} reveal={logoReveal} dotReveal={dotReveal} glow={1} />
          <div style={{
            fontFamily: "'Syne', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: 56,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: wordReveal,
            transform: `translateY(${(1 - wordReveal) * 14}px)`,
          }}>
            <span style={{ color: ACCENT, textShadow: `0 0 24px ${ACCENT}` }}>Neon</span>{" "}
            <span style={{ color: "#fff" }}>Narrative</span>
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.32em",
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            opacity: subTagReveal * (1 - layoutProgress * 0.5),
            transform: `translateY(${(1 - subTagReveal) * 8}px)`,
            marginTop: -8,
          }}>
            AI Operations &nbsp;·&nbsp; Digital Growth
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Master timeline ─────────────────────────────────
function Intro() {
  return (
    <div style={{ width: W, height: H, position: "relative", background: BG, overflow: "hidden" }}>
      {/* Persistent base BG */}
      <div style={{ position: "absolute", inset: 0, background: BG }} />

      <Sprite start={0}   end={2.0}>{() => <Scene1 />}</Sprite>
      <Sprite start={2.0} end={5.0}>{() => <Scene2 />}</Sprite>
      <Sprite start={5.0} end={1000}>{() => <Scene4 />}</Sprite>

      {/* Top-layer film grain */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
        mixBlendMode: "overlay",
        pointerEvents: "none",
        opacity: 0.7,
      }} />

      {/* Subtle outer vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Stage width={W} height={H} duration={DUR} background={BG} loop={false} autoplay={true} persistKey="neon-intro">
    <Intro />
  </Stage>
);
