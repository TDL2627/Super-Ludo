import { useState, useEffect, useCallback, useRef } from "react";

// ─── ELEMENTAL THEME ──────────────────────────────────────────────────────────

const ELEMENTS = {
  fire:  {
    color: "red",
    name: "Fire", emoji: "🔥", symbol: "♨",
    fill: "#dc2626", light: "#fef2f2", dark: "#991b1b", border: "#f87171",
    glow: "#ef4444", gradFrom: "#dc2626", gradTo: "#ef4444",
    baseBg: "linear-gradient(145deg,#7f1d1d,#991b1b)",
    particleColor: "#fca5a5",
    pawnHead: "🔥",
  },
  water: {
    color: "blue",
    name: "Water", emoji: "💧", symbol: "∿",
    fill: "#0ea5e9", light: "#f0f9ff", dark: "#075985", border: "#38bdf8",
    glow: "#0ea5e9", gradFrom: "#0284c7", gradTo: "#0ea5e9",
    baseBg: "linear-gradient(145deg,#0c4a6e,#0369a1)",
    particleColor: "#7dd3fc",
    pawnHead: "💧",
  },
  air:   {
    color: "green",
    name: "Air",   emoji: "🌪️", symbol: "≋",
    fill: "#cbd5e1", light: "#f8fafc", dark: "#64748b", border: "#e2e8f0",
    glow: "#94a3b8", gradFrom: "#94a3b8", gradTo: "#cbd5e1",
    baseBg: "linear-gradient(145deg,#1e293b,#334155)",
    particleColor: "#f1f5f9",
    pawnHead: "🌪️",
  },
  earth: {
    color: "yellow",
    name: "Earth", emoji: "🪨", symbol: "⬡",
    fill: "#92400e", light: "#fef3c7", dark: "#451a03", border: "#a16207",
    glow: "#78350f", gradFrom: "#78350f", gradTo: "#92400e",
    baseBg: "linear-gradient(145deg,#1c0a00,#3b1a06)",
    particleColor: "#d97706",
    pawnHead: "🪨",
  },
};

// Canonical order: fire=red, water=blue, air=green, earth=yellow
const ELEM_ORDER = ["fire","water","air","earth"];
const COLOR_TO_ELEM = { red:"fire", blue:"water", green:"air", yellow:"earth" };
const COLORS = ["red","blue","green","yellow"];

function elem(color) { return ELEMENTS[COLOR_TO_ELEM[color]]; }

// ─── BOARD CONSTANTS ──────────────────────────────────────────────────────────

const CELL = 40, BOARD = 600;

const MAIN_PATH = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],
  [6,0],
];

const HOME_STRETCHES = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

const START_POS  = { red:1, blue:14, green:27, yellow:40 };
const SAFE_SPOTS = new Set([1,9,14,22,27,35,40,48]);

// Safe cell emojis matching elements
const SAFE_CELL_EMOJI = ["🔥","💧","🌪️","🪨","🔥","💧","🌪️","🪨"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getRelativePos(color, absPos) { return (absPos - START_POS[color] + 52) % 52; }
function getAbsolutePos(color, relPos) { return (START_POS[color] + relPos) % 52; }
function isAtSafeSpot(absPos)          { return SAFE_SPOTS.has(absPos); }

function getCellRC(token) {
  if (token.state === "base" || token.state === "home") return null;
  if (token.state === "homestretch") return HOME_STRETCHES[token.color][token.homeStretchPos];
  return MAIN_PATH[token.absPos];
}

function createInitialTokens() {
  const t = {};
  COLORS.forEach(c => {
    t[c] = [0,1,2,3].map(id => ({ id, color:c, state:"base", absPos:null, relPos:null, homeStretchPos:null }));
  });
  return t;
}

// ─── ELEMENTAL PAWN ──────────────────────────────────────────────────────────
// A stylized pawn shape with an element emoji "shield" on its chest

function ElementPawn({ x, y, size, color, glow, onClick, clickable }) {
  const e = elem(color);
  const s = size;
  return (
    <g onClick={onClick} style={{ cursor: clickable ? "pointer" : "default" }}>
      {/* Glow aura */}
      {glow && (
        <circle cx={x} cy={y} r={s*0.82} fill={e.fill} opacity="0.2"
          style={{ animation:"elemPulse 0.85s ease-in-out infinite" }}/>
      )}
      {/* Shadow */}
      <ellipse cx={x} cy={y+s*0.42} rx={s*0.44} ry={s*0.13} fill="#000" opacity="0.35"/>
      {/* Pawn base */}
      <ellipse cx={x} cy={y+s*0.35} rx={s*0.4} ry={s*0.12} fill={e.dark} opacity="0.85"/>
      {/* Body */}
      <path d={`M${x-s*0.22},${y+s*0.28}
                Q${x-s*0.3},${y+s*0.04} ${x-s*0.15},${y-s*0.06}
                Q${x-s*0.09},${y-s*0.14} ${x},${y-s*0.14}
                Q${x+s*0.09},${y-s*0.14} ${x+s*0.15},${y-s*0.06}
                Q${x+s*0.3},${y+s*0.04} ${x+s*0.22},${y+s*0.28} Z`}
        fill={e.fill} stroke={e.dark} strokeWidth="1.2"/>
      {/* Head circle */}
      <circle cx={x} cy={y-s*0.26} r={s*0.21} fill={e.fill} stroke={e.dark} strokeWidth="1.2"/>
      {/* Shine */}
      <circle cx={x-s*0.07} cy={y-s*0.33} r={s*0.07} fill="white" opacity="0.55"/>
      {/* Element emoji on chest */}
      <text x={x} y={y+s*0.12} textAnchor="middle" dominantBaseline="central"
        fontSize={s*0.28} style={{ userSelect:"none", pointerEvents:"none" }}>
        {e.emoji}
      </text>
      {/* Movable ring */}
      {glow && (
        <ellipse cx={x} cy={y+s*0.35} rx={s*0.46} ry={s*0.15}
          fill="none" stroke="#fff176" strokeWidth="2.2" opacity="0.9"
          style={{ animation:"elemPulse 0.85s ease-in-out infinite" }}/>
      )}
    </g>
  );
}

// ─── ELEMENTAL DICE ──────────────────────────────────────────────────────────
// Each element has its own dot symbol and face color

const DICE_DOTS = {
  1:[[50,50]],
  2:[[28,28],[72,72]],
  3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],
  5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
};

const ELEM_DICE_DOT = { fire:"🔥", water:"💧", air:"🌀", earth:"🍂" };

function ElementDice({ value, rolling, onClick, disabled, color, size = 64 }) {
  const e = elem(color);
  const dotEmoji = ELEM_DICE_DOT[COLOR_TO_ELEM[color]];
  const fontSize = size * 0.22;

  return (
    <button
      onClick={onClick}
      disabled={disabled || rolling}
      title={disabled ? "Wait your turn" : "Click to roll!"}
      style={{
        width: size, height: size, borderRadius: size * 0.22,
        padding: 0, border: `2.5px solid ${e.border}`,
        background: `linear-gradient(145deg, ${e.gradFrom}22, ${e.gradTo}44)`,
        backdropFilter: "blur(4px)",
        boxShadow: rolling
          ? `0 0 22px ${e.glow}cc, inset 0 0 10px ${e.fill}44`
          : disabled
          ? "none"
          : `0 4px 16px ${e.fill}66, inset 0 1px 0 rgba(255,255,255,0.2)`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "transform 0.15s, box-shadow 0.2s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e2 => { if (!disabled && !rolling) e2.currentTarget.style.transform = "scale(1.12) rotate(-3deg)"; }}
      onMouseLeave={e2 => { e2.currentTarget.style.transform = "scale(1)"; }}
    >
      {/* Elemental bg texture */}
      <div style={{
        position:"absolute", inset:0,
        background: `radial-gradient(circle at 30% 30%, ${e.fill}33, transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <svg viewBox="0 0 100 100" width="100%" height="100%"
        style={{ display:"block", animation: rolling ? "elemSpin 0.15s linear infinite" : "none" }}>
        {(DICE_DOTS[value||1]||[]).map(([cx,cy],i) => (
          <text key={i} x={cx} y={cy+5} textAnchor="middle" dominantBaseline="central"
            fontSize={fontSize * 4.2} style={{ userSelect:"none" }}>
            {dotEmoji}
          </text>
        ))}
      </svg>
    </button>
  );
}

// ─── SVG BOARD ────────────────────────────────────────────────────────────────

function LudoBoard({ allTokens, onTokenClick, movableTokenIds }) {
  const cellMap = {};
  COLORS.forEach(color => {
    allTokens[color].forEach(token => {
      if (token.state === "base" || token.state === "home") return;
      const rc = getCellRC(token);
      if (!rc) return;
      const key = `${rc[0]}-${rc[1]}`;
      if (!cellMap[key]) cellMap[key] = [];
      cellMap[key].push(token);
    });
  });
  const homeTokens = COLORS.flatMap(c => allTokens[c].filter(t => t.state === "home"));
  const baseTokensMap = {};
  COLORS.forEach(c => { baseTokensMap[c] = allTokens[c].filter(t => t.state === "base"); });

  const pathSet    = new Set(MAIN_PATH.map(([r,c]) => `${r}-${c}`));
  const safeRC     = new Set([...SAFE_SPOTS].map(i => `${MAIN_PATH[i][0]}-${MAIN_PATH[i][1]}`));
  const safeIdx    = {};
  [...SAFE_SPOTS].forEach((abs,i) => { safeIdx[`${MAIN_PATH[abs][0]}-${MAIN_PATH[abs][1]}`] = i; });
  const hsColorMap = {};
  Object.entries(HOME_STRETCHES).forEach(([color,cells]) => {
    cells.forEach(([r,c]) => { hsColorMap[`${r}-${c}`] = color; });
  });
  const startRC = {};
  Object.entries(START_POS).forEach(([color,idx]) => {
    startRC[`${MAIN_PATH[idx][0]}-${MAIN_PATH[idx][1]}`] = color;
  });

  // ── PATH CELL ──
  function renderPathCell(row, col) {
    const key = `${row}-${col}`;
    if (!pathSet.has(key) && !hsColorMap[key]) return null;
    const [x,y]   = [col*CELL, row*CELL];
    const tokens  = cellMap[key] || [];
    const isSafe  = safeRC.has(key);
    const hsColor = hsColorMap[key];
    const startColor = startRC[key];
    const movable = tokens.some(t => movableTokenIds.includes(`${t.color}-${t.id}`));
    const safeEmojiIdx = safeIdx[key];

    let bg = "#1c1917";
    if (hsColor)    bg = elem(hsColor).dark + "55";
    if (startColor) bg = elem(startColor).dark + "66";
    if (isSafe && !startColor) bg = "#292524";

    return (
      <g key={key}>
        <rect x={x} y={y} width={CELL} height={CELL} fill={bg} stroke="#3d3532" strokeWidth="0.6"/>
        {/* Home stretch colored fill */}
        {hsColor && (
          <rect x={x+1} y={y+1} width={CELL-2} height={CELL-2}
            fill={elem(hsColor).fill} opacity="0.18" rx="3"/>
        )}
        {/* Safe spot element emoji */}
        {isSafe && !startColor && !tokens.length && (
          <text x={x+CELL/2} y={y+CELL/2} textAnchor="middle" dominantBaseline="central"
            fontSize="17" style={{ userSelect:"none" }}>
            {SAFE_CELL_EMOJI[safeEmojiIdx % SAFE_CELL_EMOJI.length]}
          </text>
        )}
        {/* Start cell — element portal */}
        {startColor && !tokens.length && (
          <text x={x+CELL/2} y={y+CELL/2} textAnchor="middle" dominantBaseline="central"
            fontSize="14" style={{ userSelect:"none" }}>
            {elem(startColor).emoji}
          </text>
        )}
        {/* Movable highlight */}
        {movable && (
          <rect x={x+1.5} y={y+1.5} width={CELL-3} height={CELL-3}
            fill="rgba(255,241,118,0.12)" stroke="#fff176" strokeWidth="2.5" rx="4"
            style={{ animation:"elemPulse 0.85s ease-in-out infinite" }}/>
        )}
        {/* Tokens */}
        {tokens.map((t, i) => {
          const n = tokens.length;
          const offs = n===1?[[0,0]]:n===2?[[-8,0],[8,0]]:n===3?[[-8,-5],[8,-5],[0,7]]:[[-7,-7],[7,-7],[-7,7],[7,7]];
          const [ox,oy] = offs[i] || [0,0];
          const isM = movableTokenIds.includes(`${t.color}-${t.id}`);
          return (
            <ElementPawn key={`${t.color}-${t.id}`}
              x={x+CELL/2+ox} y={y+CELL/2+oy} size={n>2?15:19}
              color={t.color} glow={isM}
              onClick={e => { e.stopPropagation(); if(isM) onTokenClick(t); }}
              clickable={isM}/>
          );
        })}
      </g>
    );
  }

  // ── BASE YARD ──
  function renderBase(color) {
    const corners = { red:[0,0], blue:[0,9], green:[9,9], yellow:[9,0] };
    const [br,bc] = corners[color];
    const bx = bc*CELL, by = br*CELL, bsize = 6*CELL;
    const mid = bsize/2;
    const e = elem(color);
    const tokens = baseTokensMap[color];

    const slots = [
      [bx+CELL*1.52, by+CELL*1.52],
      [bx+CELL*4.0,  by+CELL*1.52],
      [bx+CELL*1.52, by+CELL*4.0],
      [bx+CELL*4.0,  by+CELL*4.0],
    ];

    return (
      <g key={`base-${color}`}>
        {/* Outer colored yard */}
        <defs>
          <radialGradient id={`baseGrad-${color}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={e.fill} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={e.dark} stopOpacity="1"/>
          </radialGradient>
        </defs>
        <rect x={bx} y={by} width={bsize} height={bsize}
          fill={`url(#baseGrad-${color})`} rx="8" stroke={e.border} strokeWidth="2.5"/>
        {/* Inner dark court */}
        <rect x={bx+12} y={by+12} width={bsize-24} height={bsize-24}
          fill="#0f0f0f" rx="6" opacity="0.7"/>
        {/* Elemental border glow ring */}
        <rect x={bx+12} y={by+12} width={bsize-24} height={bsize-24}
          fill="none" rx="6" stroke={e.fill} strokeWidth="1.5" opacity="0.5"/>
        {/* Big element emoji watermark */}
        <text x={bx+mid} y={by+mid} textAnchor="middle" dominantBaseline="central"
          fontSize="52" opacity="0.12" style={{ userSelect:"none", pointerEvents:"none" }}>
          {e.emoji}
        </text>
        {/* Element name label */}
        <text x={bx+mid} y={by+mid+26} textAnchor="middle" dominantBaseline="central"
          fontSize="10" fontWeight="bold" fill={e.fill} opacity="0.25" letterSpacing="3"
          style={{ userSelect:"none", pointerEvents:"none", fontFamily:"monospace" }}>
          {e.name.toUpperCase()}
        </text>
        {/* Token slots */}
        {slots.map(([sx,sy], i) => {
          const token = tokens.find(t => t.id === i);
          const isM   = token && movableTokenIds.includes(`${color}-${i}`);
          return (
            <g key={i}>
              {/* Slot ring */}
              <circle cx={sx} cy={sy} r={CELL*0.72} fill="#1a1a1a" stroke={e.dark} strokeWidth="2"/>
              <circle cx={sx} cy={sy} r={CELL*0.58} fill="none" stroke={e.fill} strokeWidth="1" opacity="0.35"/>
              {isM && (
                <circle cx={sx} cy={sy} r={CELL*0.78}
                  fill="none" stroke="#fff176" strokeWidth="2.5" opacity="0.9"
                  style={{ animation:"elemPulse 0.85s ease-in-out infinite" }}/>
              )}
              {token && (
                <ElementPawn x={sx} y={sy} size={30} color={color} glow={isM}
                  onClick={() => { if(isM) onTokenClick(token); }}
                  clickable={isM}/>
              )}
              {/* Empty slot element dot */}
              {!token && (
                <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central"
                  fontSize="16" opacity="0.25" style={{ userSelect:"none" }}>{e.emoji}</text>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  // ── CENTER HOME ──
  function renderCenter() {
    const x=6*CELL, y=6*CELL, s=3*CELL, mid=s/2;
    const cx=x+mid, cy=y+mid;
    return (
      <g key="center">
        <rect x={x} y={y} width={s} height={s} fill="#0a0a0a" stroke="#333" strokeWidth="0.5"/>
        {/* Elemental triangles */}
        <polygon points={`${x},${y} ${x+s},${y} ${cx},${cy}`}
          fill={elem("blue").fill} opacity="0.75"/>
        <polygon points={`${x+s},${y} ${x+s},${y+s} ${cx},${cy}`}
          fill={elem("green").fill} opacity="0.75"/>
        <polygon points={`${x+s},${y+s} ${x},${y+s} ${cx},${cy}`}
          fill={elem("yellow").fill} opacity="0.75"/>
        <polygon points={`${x},${y+s} ${x},${y} ${cx},${cy}`}
          fill={elem("red").fill} opacity="0.75"/>
        {/* Triangle element emojis */}
        <text x={cx} y={y+mid*0.45} textAnchor="middle" dominantBaseline="central" fontSize="11">💧</text>
        <text x={x+s-mid*0.45} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11">🌪️</text>
        <text x={cx} y={y+s-mid*0.45} textAnchor="middle" dominantBaseline="central" fontSize="11">🪨</text>
        <text x={x+mid*0.45} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11">🔥</text>
        {/* Center portal */}
        <circle cx={cx} cy={cy} r={mid*0.38} fill="#0f0f0f" stroke="#555" strokeWidth="1"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="24">🌐</text>
        {/* Home tokens */}
        {homeTokens.map((t,i) => {
          const off=[[-11,-11],[11,-11],[-11,11],[11,11]];
          const [ox,oy]=off[i]||[0,0];
          return <ElementPawn key={`${t.color}-${t.id}`} x={cx+ox} y={cy+oy} size={14}
            color={t.color} glow={false} clickable={false}/>;
        })}
      </g>
    );
  }

  // Grid lines
  function renderGrid() {
    const lines = [];
    for(let r=0;r<=15;r++) lines.push(<line key={`h${r}`} x1={0} y1={r*CELL} x2={BOARD} y2={r*CELL} stroke="#2a2520" strokeWidth="0.5"/>);
    for(let c=0;c<=15;c++) lines.push(<line key={`v${c}`} x1={c*CELL} y1={0} x2={c*CELL} y2={BOARD} stroke="#2a2520" strokeWidth="0.5"/>);
    return <g>{lines}</g>;
  }

  const allCells = [];
  for(let r=0;r<15;r++) for(let c=0;c<15;c++) {
    const k=`${r}-${c}`;
    if(pathSet.has(k)||hsColorMap[k]) allCells.push(renderPathCell(r,c));
  }

  return (
    <svg viewBox={`0 0 ${BOARD} ${BOARD}`}
      style={{
        width:"100%",height:"100%",display:"block",
        maxWidth:"min(96vw,96vh,600px)",margin:"0 auto",
        borderRadius:12,
        boxShadow:"0 0 0 3px #555, 0 0 0 5px #222, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(249,115,22,0.1)",
      }}>
      <defs>
        <style>{`
          @keyframes elemPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes elemSpin  { from{transform-origin:50px 50px;transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
        <pattern id="darkBoard" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#1a1614"/>
          <rect x="0" y="0" width="3" height="3" fill="#1c1917" opacity="0.6"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Dark elemental board background */}
      <rect width={BOARD} height={BOARD} fill="url(#darkBoard)" rx="10"/>

      {/* Base yards */}
      {COLORS.map(c => renderBase(c))}
      {/* Path cells */}
      {allCells}
      {/* Grid */}
      {renderGrid()}
      {/* Center */}
      {renderCenter()}

      {/* Outer border */}
      <rect x="1.5" y="1.5" width={BOARD-3} height={BOARD-3} fill="none" rx="10"
        stroke="#555" strokeWidth="3"/>
    </svg>
  );
}

// ─── PLAYER + DICE CARD ──────────────────────────────────────────────────────
// Each player card has their own dice built in

function PlayerDiceCard({ color, name, isBot, tokens, isCurrentTurn, diceValue, rolling, canRoll, onRoll, onTokenClick, movableTokenIds, compact=false }) {
  const e = elem(color);
  const atHome = tokens.filter(t => t.state === "home").length;
  const isMovableToken = (t) => movableTokenIds.includes(`${color}-${t.id}`);
  const diceSize = compact ? 40 : 52;
  const pad = compact ? "8px 10px" : "12px 14px";
  const nameSize = compact ? 12 : 13;
  const subSize = compact ? 9 : 10;
  const pipSize = compact ? 14 : 18;
  const emojiSize = compact ? 17 : 22;
  const gap = compact ? 6 : 8;

  return (
    <div style={{
      borderRadius: 14,
      border: `2px solid ${isCurrentTurn ? e.border : "rgba(255,255,255,0.08)"}`,
      background: isCurrentTurn
        ? `linear-gradient(145deg, ${e.dark}99, #0f0f0f)`
        : "rgba(15,15,15,0.8)",
      transition: "all 0.3s",
      transform: isCurrentTurn ? "scale(1.02)" : "scale(1)",
      boxShadow: isCurrentTurn
        ? `0 0 20px ${e.glow}55, 0 6px 24px rgba(0,0,0,0.6)`
        : "0 2px 10px rgba(0,0,0,0.4)",
      padding: pad,
      backdropFilter: "blur(12px)",
      position: "relative", overflow: "hidden",
    }}>
      {isCurrentTurn && (
        <div style={{
          position:"absolute", inset:0, opacity:0.1,
          background:`radial-gradient(ellipse at 50% 0%, ${e.fill}, transparent 70%)`,
          pointerEvents:"none",
        }}/>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap, marginBottom: compact ? 6 : 10 }}>
        <span style={{ fontSize: emojiSize, lineHeight:1 }}>{e.emoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize: nameSize, color: isCurrentTurn ? e.border : "rgba(255,255,255,0.8)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {name}
          </div>
          <div style={{ fontSize: subSize, color: e.fill, opacity:0.8, fontWeight:600, letterSpacing:1 }}>
            {e.name.toUpperCase()}{isBot && " · BOT"}
          </div>
        </div>
        {isCurrentTurn && (
          <span style={{ fontSize:9, color: e.border, animation:"elemPulse 0.85s ease-in-out infinite", whiteSpace:"nowrap" }}>▶ TURN</span>
        )}
      </div>

      {/* Token pips */}
      <div style={{ display:"flex", gap: compact ? 3 : 4, marginBottom: compact ? 6 : 10, alignItems:"center" }}>
        {tokens.map(t => (
          <div key={t.id} onClick={() => isMovableToken(t) ? onTokenClick(t) : null}
            style={{
              width: pipSize, height: pipSize, borderRadius:"50%",
              background: t.state === "home" ? e.fill : t.state === "base" ? "#333" : e.fill,
              opacity: t.state === "base" ? 0.3 : 1,
              border: isMovableToken(t) ? `2px solid #fff176` : `1.5px solid ${e.dark}`,
              cursor: isMovableToken(t) ? "pointer" : "default",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: compact ? 7 : 9,
              boxShadow: t.state==="home" ? `0 0 6px ${e.glow}` : "none",
              animation: isMovableToken(t) ? "elemPulse 0.85s ease-in-out infinite" : "none",
              transition:"all 0.2s", flexShrink:0,
            }}>
            {t.state !== "base" && <span style={{ color:"white", fontWeight:700 }}>{e.emoji[0]}</span>}
          </div>
        ))}
        <span style={{ fontSize: subSize, color:"rgba(255,255,255,0.4)", marginLeft:"auto", whiteSpace:"nowrap" }}>{atHome}/4 🏠</span>
      </div>

      {/* Dice row */}
      <div style={{ display:"flex", alignItems:"center", gap: compact ? 8 : 10 }}>
        <ElementDice
          value={isCurrentTurn ? (diceValue || 1) : 1}
          rolling={isCurrentTurn && rolling}
          onClick={onRoll}
          disabled={!canRoll || !isCurrentTurn}
          color={color}
          size={diceSize}
        />
        <div style={{ flex:1, minWidth:0 }}>
          {isCurrentTurn && diceValue ? (
            <div style={{ color: e.border, fontWeight:700, fontSize: compact ? 12 : 14 }}>
              Rolled: <span style={{ fontSize: compact ? 17 : 20 }}>{diceValue}</span>
            </div>
          ) : isCurrentTurn ? (
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize: compact ? 10 : 11 }}>
              {canRoll ? (isBot ? "Rolling..." : "Tap dice!") : "Choose pawn"}
            </div>
          ) : (
            <div style={{ color:"rgba(255,255,255,0.2)", fontSize: compact ? 10 : 11 }}>Waiting…</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GAME LOGIC HOOK ──────────────────────────────────────────────────────────

function useGameLogic(players) {
  const playerColors = Object.keys(players);
  const [tokens,        setTokens]        = useState(createInitialTokens);
  const [currentTurn,   setCurrentTurn]   = useState(playerColors[0]);
  const [diceValue,     setDiceValue]     = useState(null);
  const [diceRolled,    setDiceRolled]    = useState(false);
  const [rolling,       setRolling]       = useState(false);
  const [movableTokenIds, setMovableTokenIds] = useState([]);
  const [winner,        setWinner]        = useState(null);
  const [message,       setMessage]       = useState("🌍 Roll to awaken the elements!");
  const botRef = useRef(null);

  const nextTurn = useCallback((currentColor, gotSix) => {
    if (gotSix) {
      setDiceValue(null); setDiceRolled(false); setMovableTokenIds([]);
      setMessage(`${elem(currentColor).emoji} ${players[currentColor]?.name} rolled 6 — roll again!`);
      return;
    }
    const idx  = playerColors.indexOf(currentColor);
    const next = playerColors[(idx+1) % playerColors.length];
    setCurrentTurn(next);
    setDiceValue(null); setDiceRolled(false); setMovableTokenIds([]);
    setMessage(`${elem(next).emoji} ${players[next]?.name}'s turn!`);
  }, [playerColors, players]);

  const computeMovable = useCallback((color, roll, toks) => {
    return toks[color].reduce((acc, t) => {
      if (t.state === "home") return acc;
      if (t.state === "base") { if (roll === 6) acc.push(`${color}-${t.id}`); return acc; }
      if (t.state === "homestretch") { if (t.homeStretchPos + roll <= 5) acc.push(`${color}-${t.id}`); return acc; }
      if (getRelativePos(color, t.absPos) + roll <= 57) acc.push(`${color}-${t.id}`);
      return acc;
    }, []);
  }, []);

  const rollDice = useCallback(() => {
    if (rolling || diceRolled) return;
    setRolling(true);
    let count = 0;
    const iv = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      if (++count >= 8) {
        clearInterval(iv);
        const final = Math.ceil(Math.random() * 6);
        setDiceValue(final); setRolling(false); setDiceRolled(true);
        setTokens(prev => {
          const movable = computeMovable(currentTurn, final, prev);
          setMovableTokenIds(movable);
          if (!movable.length) {
            setMessage(`${elem(currentTurn).emoji} No moves — turn skipped`);
            setTimeout(() => nextTurn(currentTurn, false), 1300);
          } else {
            setMessage(`Rolled ${final} — choose a ${elem(currentTurn).name} warrior!`);
          }
          return prev;
        });
      }
    }, 80);
  }, [rolling, diceRolled, currentTurn, computeMovable, nextTurn]);

  const moveToken = useCallback((token) => {
    if (!movableTokenIds.includes(`${token.color}-${token.id}`)) return;
    setTokens(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const t    = next[token.color][token.id];
      let gotSix = diceValue === 6, movedHome = false, captured = false;

      if (t.state === "base") {
        t.state = "active"; t.absPos = START_POS[token.color]; t.relPos = 0;
      } else if (t.state === "homestretch") {
        t.homeStretchPos += diceValue;
        if (t.homeStretchPos >= 5) { t.state = "home"; t.homeStretchPos = 5; movedHome = true; gotSix = false; }
      } else {
        const rel    = getRelativePos(token.color, t.absPos);
        const newRel = rel + diceValue;
        if (newRel >= 52) {
          const hp = newRel - 52;
          t.homeStretchPos = Math.min(hp, 5);
          t.state = hp >= 5 ? "home" : "homestretch"; t.absPos = null;
          if (t.state === "home") { movedHome = true; gotSix = false; }
        } else {
          const newAbs = getAbsolutePos(token.color, newRel);
          t.absPos = newAbs; t.relPos = newRel;
          if (!isAtSafeSpot(newAbs)) {
            COLORS.forEach(c => {
              if (c === token.color || !players[c]) return;
              next[c].forEach(ot => {
                if (ot.state === "active" && ot.absPos === newAbs) {
                  ot.state = "base"; ot.absPos = null; ot.relPos = null;
                  captured = true;
                  setMessage(`${elem(token.color).emoji} ${players[token.color]?.name} captured ${elem(c).emoji} ${players[c]?.name}!`);
                }
              });
            });
          }
        }
      }

      const allHome = next[token.color].every(t => t.state === "home");
      if (allHome) { setWinner(token.color); setMovableTokenIds([]); return next; }
      if (movedHome) setMessage(`${elem(token.color).emoji} Warrior reached the portal!`);
      setMovableTokenIds([]);
      setTimeout(() => nextTurn(token.color, gotSix || captured), 300);
      return next;
    });
  }, [movableTokenIds, diceValue, nextTurn, players]);

  // Bot roll
  useEffect(() => {
    if (!players[currentTurn]?.isBot || diceRolled || winner) return;
    botRef.current = setTimeout(rollDice, 1300);
    return () => clearTimeout(botRef.current);
  }, [currentTurn, diceRolled, players, winner, rollDice]);

  // Bot move
  useEffect(() => {
    if (!players[currentTurn]?.isBot || !diceRolled || !movableTokenIds.length || winner) return;
    botRef.current = setTimeout(() => {
      const myT = tokens[currentTurn];
      let best = null, bestScore = -1;
      movableTokenIds.forEach(tid => {
        const id = parseInt(tid.split("-")[1]), t = myT[id];
        let score = 0;
        if (t.state === "base") score = 10;
        else if (t.state === "homestretch") score = 50 + t.homeStretchPos;
        else {
          const rel = getRelativePos(currentTurn, t.absPos); score = 20 + rel;
          const newRel = rel + diceValue;
          if (newRel < 52) {
            const newAbs = getAbsolutePos(currentTurn, newRel);
            if (!isAtSafeSpot(newAbs)) {
              COLORS.forEach(ec => {
                if (ec === currentTurn || !players[ec]) return;
                tokens[ec].forEach(ot => { if (ot.state === "active" && ot.absPos === newAbs) score += 100; });
              });
            }
          }
        }
        if (score > bestScore) { bestScore = score; best = t; }
      });
      if (best) moveToken(best);
    }, 950);
    return () => clearTimeout(botRef.current);
  }, [diceRolled, movableTokenIds, currentTurn, tokens, diceValue, players, winner, moveToken]);

  return { tokens, currentTurn, diceValue, diceRolled, rolling, movableTokenIds, winner, message, rollDice, moveToken };
}

// ─── INTRO PAGE ───────────────────────────────────────────────────────────────

function IntroPage({ onStart }) {
  const [count, setCount]  = useState(2);
  const [names, setNames]  = useState({ red:"Ignis", blue:"Aqua", green:"Zephyr", yellow:"Terra" });
  const [bots,  setBots]   = useState({ red:false, blue:false, green:true, yellow:true });

  const elemColors = COLORS.slice(0, count);

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 12px",
      background:"radial-gradient(ellipse at 0% 0%, #4a0a0a 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, #0c3a54 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, #1e2a1e 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, #2a1000 0%, transparent 50%), #0a0a0a",
      fontFamily:"'Georgia','Times New Roman',serif",
    }}>
      <style>{`
        @keyframes elemFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-12px) scale(1.05)} }
        @keyframes elemPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>

      <div style={{ width:"100%", maxWidth:460 }}>
        {/* Title */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:8 }}>
            {ELEM_ORDER.map((el,i) => (
              <div key={el} style={{
                fontSize:38, display:"inline-block",
                animation:`elemFloat 1.4s ${i*0.22}s ease-in-out infinite`,
                filter:`drop-shadow(0 0 8px ${ELEMENTS[el].glow})`
              }}>
                {ELEMENTS[el].emoji}
              </div>
            ))}
          </div>
          <h1 style={{
            fontSize:72, fontWeight:900, margin:"0 0 6px", letterSpacing:-4, lineHeight:1,
            background:"linear-gradient(135deg,#dc2626 0%,#0ea5e9 35%,#cbd5e1 65%,#92400e 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>LUDO</h1>
          <p style={{ color:"rgba(255,255,255,0.4)", letterSpacing:5, fontSize:10, textTransform:"uppercase" }}>
            Elements Edition
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)",
          borderRadius:24, padding:28, border:"1px solid rgba(255,255,255,0.12)",
          boxShadow:"0 28px 80px rgba(0,0,0,0.7)",
        }}>
          {/* Player count */}
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:8 }}>
            SELECT WARRIORS
          </p>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {[2,3,4].map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                flex:1, padding:"10px 0", borderRadius:10, border:"none", cursor:"pointer",
                fontWeight:700, fontSize:14, transition:"all 0.2s",
                background: count===n
                  ? "linear-gradient(135deg,#f97316,#d97706)"
                  : "rgba(255,255,255,0.1)",
                color:"white",
                transform: count===n ? "scale(1.06)" : "scale(1)",
                boxShadow: count===n ? "0 4px 16px rgba(249,115,22,0.5)" : "none",
              }}>
                {n}P
              </button>
            ))}
          </div>

          {/* Element players */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
            {elemColors.map(color => {
              const e = elem(color);
              return (
                <div key={color} style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:`linear-gradient(135deg, ${e.dark}44, transparent)`,
                  borderRadius:12, padding:"8px 10px",
                  border:`1px solid ${e.fill}33`,
                }}>
                  <div style={{
                    width:38, height:38, borderRadius:"50%", flexShrink:0,
                    background:`radial-gradient(circle at 40% 35%, ${e.fill}, ${e.dark})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:20, boxShadow:`0 2px 12px ${e.fill}66`,
                  }}>{e.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <input type="text" value={names[color]} disabled={bots[color]}
                      onChange={ev => setNames(p => ({...p, [color]: ev.target.value}))}
                      placeholder={bots[color] ? `${e.name} Bot` : e.name}
                      style={{
                        width:"100%", padding:"6px 10px", borderRadius:8, fontSize:13,
                        background:"rgba(255,255,255,0.1)", border:`1px solid ${e.fill}44`,
                        color:"white", outline:"none", opacity:bots[color]?0.5:1,
                        boxSizing:"border-box",
                      }}/>
                    <div style={{ fontSize:10, color:e.fill, opacity:0.7, marginTop:2, letterSpacing:1 }}>
                      {e.name.toUpperCase()} ELEMENT
                    </div>
                  </div>
                  <label style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer",
                    color:"rgba(255,255,255,0.55)", fontSize:11, whiteSpace:"nowrap", flexShrink:0 }}>
                    <input type="checkbox" checked={bots[color]}
                      onChange={ev => setBots(p => ({...p, [color]: ev.target.checked}))}
                      style={{ accentColor:e.fill, width:14, height:14 }}/>
                    Bot
                  </label>
                </div>
              );
            })}
          </div>

          <button onClick={() => {
            const p = {};
            elemColors.forEach(c => {
              const e = elem(c);
              p[c] = { name: bots[c] ? `${e.name} Bot` : (names[c] || e.name), isBot:bots[c], color:c };
            });
            onStart(p);
          }} style={{
            width:"100%", padding:"15px 0", borderRadius:14, border:"none", cursor:"pointer",
            fontWeight:900, fontSize:16, color:"white", letterSpacing:1.5,
            background:"linear-gradient(90deg,#dc2626,#0ea5e9,#cbd5e1,#92400e)",
            boxShadow:"0 6px 28px rgba(0,0,0,0.5)", transition:"transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
            ⚡ Summon Warriors!
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── RESPONSIVE HOOK ─────────────────────────────────────────────────────────

function useWindowWidth() {
  const [width, setWidth] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────

function GameScreen({ players, onRestart }) {
  const playerColors = Object.keys(players);
  const {
    tokens, currentTurn, diceValue, diceRolled, rolling,
    movableTokenIds, winner, message, rollDice, moveToken
  } = useGameLogic(players);

  const canRoll = !diceRolled && !rolling && !winner && !players[currentTurn]?.isBot;
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 900;

  // Shared card props builder
  const cardProps = (c) => ({
    key: c,
    color: c,
    name: players[c].name,
    isBot: players[c].isBot,
    tokens: tokens[c],
    isCurrentTurn: currentTurn === c,
    diceValue: currentTurn === c ? diceValue : null,
    rolling: currentTurn === c && rolling,
    canRoll: canRoll && currentTurn === c,
    onRoll: rollDice,
    onTokenClick: moveToken,
    movableTokenIds,
  });

  const leftCols  = playerColors.filter(c => ["red","yellow"].includes(c));
  const rightCols = playerColors.filter(c => ["blue","green"].includes(c));

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      background:"radial-gradient(ellipse at 0% 0%, #4a0a0a 0%, transparent 45%), radial-gradient(ellipse at 100% 0%, #0c3a54 0%, transparent 45%), radial-gradient(ellipse at 100% 100%, #1e2a1e 0%, transparent 45%), radial-gradient(ellipse at 0% 100%, #2a1000 0%, transparent 45%), #080808",
    }}>
      <style>{`
        @keyframes elemPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes elemSpin  { from{transform-origin:50px 50px;transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 14px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.06)",
        flexShrink:0 }}>
        <span style={{
          color:"transparent", fontWeight:900, fontSize: isDesktop ? 20 : 15, letterSpacing:2,
          background:"linear-gradient(90deg,#dc2626,#0ea5e9,#cbd5e1,#92400e)",
          WebkitBackgroundClip:"text", whiteSpace:"nowrap",
        }}>⚡ ELEMENTAL LUDO</span>
        <button onClick={onRestart} style={{
          background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)",
          color:"rgba(255,255,255,0.6)", borderRadius:8, padding:"5px 12px",
          cursor:"pointer", fontSize:12, whiteSpace:"nowrap" }}>
          ↩ New Game
        </button>
      </div>

      {/* Winner overlay */}
      {winner && (() => {
        const e = elem(winner);
        return (
          <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center",
            justifyContent:"center", background:"rgba(0,0,0,0.9)", padding:16 }}>
            <div style={{
              background:`linear-gradient(145deg, ${e.dark}cc, #0a0a0a)`,
              borderRadius:24, padding:"32px 24px", textAlign:"center",
              boxShadow:`0 0 80px ${e.glow}88, 0 40px 100px rgba(0,0,0,0.8)`,
              border:`2px solid ${e.border}`, maxWidth:340, width:"100%",
            }}>
              <div style={{ fontSize:64, marginBottom:8, filter:`drop-shadow(0 0 20px ${e.glow})` }}>{e.emoji}</div>
              <h2 style={{ fontSize:26, fontWeight:900, margin:"0 0 6px", color:e.border }}>{players[winner]?.name}</h2>
              <p style={{ color:"rgba(255,255,255,0.5)", marginBottom:20, fontSize:13, letterSpacing:2 }}>
                THE {e.name.toUpperCase()} MASTER WINS!
              </p>
              <button onClick={onRestart} style={{
                width:"100%", padding:"13px 0", borderRadius:12, border:"none", cursor:"pointer",
                fontWeight:800, fontSize:15, color:"white",
                background:`linear-gradient(135deg, ${e.gradFrom}, ${e.gradTo})`,
                boxShadow:`0 6px 24px ${e.fill}88`,
              }}>⚡ Play Again</button>
            </div>
          </div>
        );
      })()}

      {/* ── DESKTOP LAYOUT: left cards | board | right cards ── */}
      {isDesktop ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
          padding:"10px 8px 52px", gap:8, maxWidth:1100, margin:"0 auto", width:"100%" }}>

          {/* Message bar */}
          <div style={{
            background:"rgba(255,255,255,0.05)", backdropFilter:"blur(12px)",
            borderRadius:12, padding:"0 22px", border:"1px solid rgba(255,255,255,0.1)",
            color:"rgba(255,255,255,0.85)", fontSize:14, textAlign:"center",
            width:"100%", maxWidth:640, letterSpacing:0.3,
            height:40, display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, overflow:"hidden",
          }}>
            <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>
              {message}
            </span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 160px",
            gap:10, alignItems:"center", width:"100%", maxWidth:1000 }}>
            {/* Left */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {leftCols.map(c => <PlayerDiceCard {...cardProps(c)}/>)}
            </div>
            {/* Board */}
            <div style={{ aspectRatio:"1/1", width:"100%", minWidth:0 }}>
              <LudoBoard allTokens={tokens} onTokenClick={moveToken} movableTokenIds={movableTokenIds}/>
            </div>
            {/* Right */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {rightCols.map(c => <PlayerDiceCard {...cardProps(c)}/>)}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
            {[["🔥💧🌪️🪨","Safe spots"],["🏁","Start"],["🌐","Home"],["✨","Movable"]].map(([ic,lb])=>(
              <div key={lb} style={{ color:"rgba(255,255,255,0.3)", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
                <span>{ic}</span><span>{lb}</span>
              </div>
            ))}
          </div>
        </div>

      ) : (
        /* ── MOBILE LAYOUT: message → board → 2×2 player grid ── */
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
          padding:"8px 8px 52px", gap:8, width:"100%", overflowY:"auto" }}>

          {/* Message bar */}
          <div style={{
            background:"rgba(255,255,255,0.05)", backdropFilter:"blur(12px)",
            borderRadius:10, padding:"0 16px", border:"1px solid rgba(255,255,255,0.1)",
            color:"rgba(255,255,255,0.85)", fontSize:13, textAlign:"center",
            width:"100%", letterSpacing:0.3,
            height:38, display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, overflow:"hidden",
          }}>
            <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>
              {message}
            </span>
          </div>

          {/* Board — full width on mobile */}
          <div style={{ width:"100%", maxWidth:"min(98vw, 98vw)", aspectRatio:"1/1", flexShrink:0 }}>
            <LudoBoard allTokens={tokens} onTokenClick={moveToken} movableTokenIds={movableTokenIds}/>
          </div>

          {/* Player cards — 2×2 grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns: playerColors.length <= 2 ? "1fr 1fr" : "1fr 1fr",
            gap:8, width:"100%",
          }}>
            {playerColors.map(c => (
              <PlayerDiceCard {...cardProps(c)} compact={true}/>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:50,
      textAlign:"center",
      padding:"8px 16px",
      background:"rgba(0,0,0,0.75)",
      backdropFilter:"blur(10px)",
      borderTop:"1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{
        fontSize:11, letterSpacing:2, fontWeight:600,
        background:"linear-gradient(90deg,#dc2626,#0ea5e9,#cbd5e1,#92400e)",
        WebkitBackgroundClip:"text", color:"transparent",
        textTransform:"uppercase",
      }}>
        © {new Date().getFullYear()} TDL2627 · All Rights Reserved
      </span>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [players, setPlayers] = useState(null);
  if (!players) return <IntroPage onStart={setPlayers}/>;
  return <GameScreen players={players} onRestart={() => setPlayers(null)}/>;
}