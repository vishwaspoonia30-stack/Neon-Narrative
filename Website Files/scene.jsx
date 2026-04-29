/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakColor, TweakRadio */
const { useEffect, useRef, useState, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "magenta": "#FF4FE0",
  "blue": "#4EB8FF",
  "speed": 1.0,
  "lampPairs": 8,
  "snowDensity": 1.0,
  "fogGlow": 0.85,
  "vignette": 0.75,
  "showOverlay": true,
  "showNote": true,
  "headline": "A walk into <em>what's next</em>.",
  "eyebrow": "Neon Narrative",
  "subcopy": "AI operations & digital marketing for brands moving forward — even in the dark.",
  "ctaLabel": "See the work"
}/*EDITMODE-END*/;

// ─── Helpers ──────────────────────────────────────────
function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Snow ─────────────────────────────────────────────
function SnowLayer({ count, sizeMin, sizeMax, speed, opacity, drift }) {
  const flakes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: sizeMin + Math.random() * (sizeMax - sizeMin),
        delay: -Math.random() * 14,
        dur: speed * (0.85 + Math.random() * 0.5),
        op: 0.4 + Math.random() * 0.5,
        sway: drift * (0.5 + Math.random()),
      });
    }
    return arr;
  }, [count, sizeMin, sizeMax, speed, drift]);

  return (
    <div className="snow-layer" style={{ opacity }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {flakes.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#eaf2ff" opacity={f.op}>
            <animate attributeName="cy" from={-5} to={110} dur={`${f.dur}s`} begin={`${f.delay}s`} repeatCount="indefinite" />
            <animate attributeName="cx"
              values={`${f.x};${f.x + f.sway};${f.x - f.sway};${f.x}`}
              dur={`${f.dur * 1.4}s`} begin={`${f.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ─── Child silhouette (more proportional, layered) ────
function Child({ glowing }) {
  return (
    <div className={`child ${glowing ? "glowing" : ""}`}>
      <div className="child-rim" />
      <svg viewBox="0 0 70 130" width="70" height="130" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="coatG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1a2030" />
            <stop offset="100%" stopColor="#080b14" />
          </linearGradient>
          <linearGradient id="hoodG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#262c3e" />
            <stop offset="100%" stopColor="#10142a" />
          </linearGradient>
          <linearGradient id="legG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#0e1220" />
            <stop offset="100%" stopColor="#04060c" />
          </linearGradient>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="35" cy="128" rx="20" ry="3" fill="#000" opacity="0.55" />

        {/* Walking legs — alternate using SMIL */}
        <g>
          <rect x="24" y="84" width="9" height="40" rx="3" fill="url(#legG)">
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 0 -2; 0 0; 0 0; 0 0"
              keyTimes="0;0.25;0.5;0.75;1"
              dur="0.85s" repeatCount="indefinite" />
          </rect>
          <rect x="37" y="84" width="9" height="40" rx="3" fill="url(#legG)">
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 0 0; 0 0; 0 -2; 0 0"
              keyTimes="0;0.25;0.5;0.75;1"
              dur="0.85s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Boots */}
        <ellipse cx="28" cy="125" rx="6" ry="2.5" fill="#03040a" />
        <ellipse cx="42" cy="125" rx="6" ry="2.5" fill="#03040a" />

        {/* Coat — bundled silhouette */}
        <path
          d="M 16 50
             Q 11 62 14 86
             L 56 86
             Q 59 62 54 50
             Q 50 42 42 40
             L 28 40
             Q 20 42 16 50 Z"
          fill="url(#coatG)"
        />

        {/* Coat seam centerline */}
        <line x1="35" y1="50" x2="35" y2="84" stroke="#000" strokeWidth="0.5" opacity="0.6" />

        {/* Mittens / hands tucked at sides */}
        <ellipse cx="14" cy="74" rx="4" ry="6" fill="#10142a" />
        <ellipse cx="56" cy="74" rx="4" ry="6" fill="#10142a" />

        {/* Scarf hint */}
        <path d="M 22 38 Q 35 42 48 38 L 50 46 Q 35 50 20 46 Z" fill="#2a3144" opacity="0.9" />

        {/* Hood / head */}
        <path
          d="M 22 22
             Q 20 12 30 8
             Q 35 5 40 8
             Q 50 12 48 24
             Q 48 36 42 42
             L 28 42
             Q 22 36 22 22 Z"
          fill="url(#hoodG)"
        />

        {/* Hood fur trim */}
        <path
          d="M 22 22 Q 20 12 30 8 Q 35 5 40 8 Q 50 12 48 24"
          fill="none" stroke="#2c3245" strokeWidth="2.5" strokeLinecap="round" opacity="0.95"
        />

        {/* Tiny puff at top of hood */}
        <circle cx="35" cy="6" r="2.2" fill="#3a4258" opacity="0.9" />
      </svg>
    </div>
  );
}

// ─── Lamp (depth-projected) ───────────────────────────
const ACTIVATE_Z = 0.32;
const VANISH_Z   = 1.0;
const CAMERA_Z   = -0.08;

function projectLamp(z) {
  const k = 5.5;
  const scale = 1 / (z * k + 0.7);
  // y in vh: horizon ~ 45vh -> ground 110vh
  const t = 1 - Math.max(0, Math.min(1, z));
  const eased = Math.pow(t, 1.55);
  const yVh = 45 + (108 - 45) * eased;
  // x splay outward
  const xVw = 8 + (52 - 8) * eased; // distance from center in vw
  return { scale, xVw, yVh };
}

function Lamp({ z, side, isLit, justActivated }) {
  const { scale, xVw, yVh } = projectLamp(z);
  const poleH = 240;     // base px before scale
  const armLen = 52;     // arm extends inward
  const fixtureW = 26;
  const armDir = side > 0 ? -1 : 1; // arm points toward center

  // Fixture sits at top of pole, displaced by armLen toward road
  const fixtureBottom = poleH - 4;
  const fixtureLeft = armDir * armLen;

  return (
    <div
      className={`lamp ${isLit ? "lit" : ""} ${justActivated ? "flashing" : ""}`}
      style={{
        left: `calc(50% + ${side * xVw}vw)`,
        top: `${yVh}vh`,
        transform: `translate(-50%, -100%) scale(${scale})`,
        transformOrigin: "50% 100%",
        zIndex: Math.round(2000 - z * 1000),
        filter: `brightness(${0.45 + (1 - z) * 0.85}) blur(${z > 0.7 ? 0.4 : 0}px)`,
      }}
    >
      {/* Pole */}
      <div className="lamp-pole" style={{ height: `${poleH}px`, left: "-2px" }} />
      {/* Base */}
      <div className="lamp-base" style={{ left: 0 }} />

      {/* Curved arm via SVG */}
      <svg
        className="lamp-arm"
        width={armLen + 10}
        height="60"
        viewBox={`0 0 ${armLen + 10} 60`}
        style={{
          left: armDir > 0 ? "0" : `-${armLen + 10}px`,
          bottom: `${poleH - 8}px`,
          transform: armDir < 0 ? "scaleX(-1)" : "none",
          transformOrigin: "right center",
        }}
      >
        <path
          d={`M 0 50 Q ${armLen * 0.6} 50 ${armLen * 0.6} 20 L ${armLen} 20`}
          fill="none"
          stroke="#171c2c"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M 0 50 Q ${armLen * 0.6} 50 ${armLen * 0.6} 20 L ${armLen} 20`}
          fill="none"
          stroke="#2a3146"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Fixture + tube */}
      <div
        className="lamp-fixture"
        style={{
          bottom: `${fixtureBottom}px`,
          left: `${fixtureLeft - fixtureW / 2}px`,
        }}
      >
        <div className="lamp-tube" />
      </div>

      {/* Halos at lamp head */}
      <div
        className="lamp-halo"
        style={{
          bottom: `${fixtureBottom - 4}px`,
          left: `${fixtureLeft}px`,
        }}
      />
      <div
        className="lamp-halo-2"
        style={{
          bottom: `${fixtureBottom - 4}px`,
          left: `${fixtureLeft}px`,
        }}
      />

      {/* Volumetric cone falling toward ground */}
      <div
        className="lamp-cone"
        style={{
          bottom: `0px`,
          left: `${fixtureLeft}px`,
          height: `${poleH - 10}px`,
        }}
      />
    </div>
  );
}

// ─── Scene ────────────────────────────────────────────
function Scene() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const {
    magenta, blue, speed, lampPairs, snowDensity,
    fogGlow, vignette, showOverlay, showNote,
    headline, eyebrow, subcopy, ctaLabel,
  } = tweaks;

  const [noteHidden, setNoteHidden] = useState(false);

  // CSS color tokens for neon
  const cssVars = useMemo(() => ({
    "--neon-magenta":      magenta,
    "--neon-magenta-soft": hexToRgba(magenta, 0.55),
    "--neon-blue":         blue,
    "--neon-blue-soft":    hexToRgba(blue, 0.45),
    "--tube-on":           "#fff",
    "--fog-glow":          fogGlow,
    "--ground-speed":      `${4 / Math.max(0.2, speed)}s`,
    "--brand-accent":      "#c4ff4d",
  }), [magenta, blue, fogGlow, speed]);

  // Lamps
  const lampStateRef = useRef([]);
  const [, force] = useState(0);
  const tick = () => force(x => (x + 1) % 1e9);

  useEffect(() => {
    const lamps = [];
    const slots = Math.max(3, lampPairs);
    const zStep = (VANISH_Z - CAMERA_Z) / slots;
    let id = 0;
    for (let i = 0; i < slots; i++) {
      const z = VANISH_Z - i * zStep;
      lamps.push({ id: id++, z, side: -1, lit: false, justActivated: false, activatedAt: 0 });
      lamps.push({ id: id++, z, side: +1, lit: false, justActivated: false, activatedAt: 0 });
    }
    lampStateRef.current = lamps;
    force(x => x + 1);
  }, [lampPairs]);

  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());
  useEffect(() => {
    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;
      const v = 0.085 * speed;
      const lamps = lampStateRef.current;
      for (const l of lamps) {
        l.z -= v * dt;
        if (!l.lit && l.z <= ACTIVATE_Z && l.z > CAMERA_Z) {
          l.lit = true;
          l.justActivated = true;
          l.activatedAt = now;
        }
        if (l.justActivated && now - l.activatedAt > 900) l.justActivated = false;
        if (l.z < CAMERA_Z - 0.05) {
          const maxZ = lamps.reduce((m, x) => Math.max(m, x.z), -Infinity);
          const slots = Math.max(3, lampPairs);
          const zStep = (VANISH_Z - CAMERA_Z) / slots;
          l.z = maxZ + zStep / 2;
          l.lit = false;
          l.justActivated = false;
        }
      }
      tick();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, lampPairs]);

  const childGlowing = lampStateRef.current.some(
    l => l.lit && l.z < ACTIVATE_Z + 0.05 && l.z > CAMERA_Z + 0.02
  );

  // Render headline w/ <em> support
  const renderHeadline = () => {
    const parts = headline.split(/(<em>|<\/em>)/g);
    let inEm = false;
    return parts.map((p, i) => {
      if (p === "<em>") { inEm = true; return null; }
      if (p === "</em>") { inEm = false; return null; }
      if (!p) return null;
      return inEm ? <em key={i}>{p}</em> : <span key={i}>{p}</span>;
    });
  };

  return (
    <div className="stage" style={cssVars}>
      <div className="sky" />
      <div className="stars" />

      {/* Ground perspective plane */}
      <div className="ground-wrap">
        <div className="ground">
          <div className="ground-snow" />
          <div className="ground-lane" />
        </div>
      </div>

      {/* Far snow */}
      <SnowLayer count={Math.round(38 * snowDensity)} sizeMin={0.15} sizeMax={0.32} speed={16 / speed} opacity={0.55} drift={2.5} />

      {/* Lamps */}
      <div className="world">
        {lampStateRef.current.map(l => (
          <Lamp key={l.id} z={l.z} side={l.side} isLit={l.lit} justActivated={l.justActivated} />
        ))}
      </div>

      {/* Volumetric color fog band */}
      <div className="colorfog" />
      {/* Cold gray fog wall */}
      <div className="fog" />

      {/* Mid snow */}
      <SnowLayer count={Math.round(55 * snowDensity)} sizeMin={0.25} sizeMax={0.55} speed={10 / speed} opacity={0.85} drift={4.5} />

      {/* Child */}
      <Child glowing={childGlowing} />

      {/* Near snow (large, blurry) */}
      <SnowLayer count={Math.round(28 * snowDensity)} sizeMin={0.5} sizeMax={1.1} speed={5.5 / speed} opacity={0.95} drift={7} />

      {/* Foreground DOF blur band */}
      <div className="dof-near" />

      {/* Color grade + vignette */}
      <div className="grade" />
      <div
        className="vignette"
        style={{
          background: `radial-gradient(ellipse 90% 80% at 50% 55%, transparent ${50 - vignette * 22}%, rgba(0,0,0,${0.55 * vignette + 0.18}) 88%, rgba(0,0,0,${0.78 * vignette + 0.15}) 100%)`,
        }}
      />

      {/* Homepage overlay */}
      {showOverlay && (
        <div className="overlay">
          <div className="overlay-top">
            <div className="logo">
              {/* Inline simplified mark inspired by user's brand */}
              <svg viewBox="0 0 40 40" fill="none">
                <rect x="2" y="2" width="36" height="36" rx="2" stroke="#fff" strokeWidth="2" fill="none" />
                <rect x="9"  y="22" width="4" height="10" fill="#fff" />
                <rect x="17" y="16" width="4" height="16" fill="#fff" />
                <rect x="25" y="11" width="4" height="21" fill="#fff" />
                <path d="M 8 28 L 32 8" stroke="#c4ff4d" strokeWidth="3" strokeLinecap="round" />
                <path d="M 32 8 L 27 8 M 32 8 L 32 13" stroke="#c4ff4d" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="word"><span className="accent">NEON</span> NARRATIVE</div>
            </div>
            <div className="nav">
              <a>Work</a>
              <a>Approach</a>
              <a>About</a>
              <a>Contact</a>
            </div>
          </div>

          <div className="overlay-center">
            <div className="eyebrow">{eyebrow}</div>
            <h1 className="headline">{renderHeadline()}</h1>
            <p className="subcopy">{subcopy}</p>
            <div className="cta"><span className="dot" /> {ctaLabel}</div>
          </div>

          <div className="overlay-bottom">
            <span>Scroll</span>
            <span>© 2026</span>
          </div>
        </div>
      )}

      {/* Heads-up note */}
      {showNote && !noteHidden && (
        <div className="note">
          <span className="hide" onClick={() => setNoteHidden(true)}>×</span>
          <strong>Heads up — this is a stylized scene</strong>, not photoreal video.
          For a real-human cinematic plate, you'll want stock footage (Artgrid / Pexels)
          or AI video generation (Sora, Runway, Veo). I can compose this scene over real
          footage as a foreground/effects layer if helpful.
        </div>
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Neon">
          <TweakColor label="Magenta" value={magenta} onChange={v => setTweak("magenta", v)} />
          <TweakColor label="Blue"    value={blue}    onChange={v => setTweak("blue", v)} />
          <TweakSlider label="Fog glow" min={0} max={1.4} step={0.05} value={fogGlow}  onChange={v => setTweak("fogGlow", v)} />
          <TweakSlider label="Vignette" min={0} max={1}   step={0.05} value={vignette} onChange={v => setTweak("vignette", v)} />
        </TweakSection>
        <TweakSection title="Motion">
          <TweakSlider label="Walk speed" min={0.3} max={2.5} step={0.05} value={speed}       onChange={v => setTweak("speed", v)} />
          <TweakSlider label="Lamp pairs" min={4}   max={14}  step={1}    value={lampPairs}   onChange={v => setTweak("lampPairs", v)} />
          <TweakSlider label="Snow"       min={0}   max={2}   step={0.1}  value={snowDensity} onChange={v => setTweak("snowDensity", v)} />
        </TweakSection>
        <TweakSection title="Overlay">
          <TweakToggle label="Show homepage overlay" value={showOverlay} onChange={v => setTweak("showOverlay", v)} />
          <TweakToggle label="Show heads-up note"    value={showNote}    onChange={v => setTweak("showNote", v)} />
          {showOverlay && (
            <>
              <TextField label="Eyebrow"  value={eyebrow}  onChange={v => setTweak("eyebrow", v)} />
              <TextField label="Headline (use <em>x</em> for accent)" value={headline} onChange={v => setTweak("headline", v)} multiline rows={2} />
              <TextField label="Subcopy"  value={subcopy}  onChange={v => setTweak("subcopy", v)} multiline rows={3} />
              <TextField label="CTA label" value={ctaLabel} onChange={v => setTweak("ctaLabel", v)} />
            </>
          )}
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function TextField({ label, value, onChange, multiline, rows = 2 }) {
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6,
    color: "inherit",
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    resize: multiline ? "vertical" : "none",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
      <label style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={inputStyle} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Scene />);
