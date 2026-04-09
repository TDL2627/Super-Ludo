import { BOARD, CELL, COLORS, HOME_STRETCHES, MAIN_PATH, SAFE_CELL_EMOJI, SAFE_SPOTS, SPECIAL_TILE_BY_POS, START_POS } from "../game/constants";
import { elem, getCellRC } from "../game/utils";
import ElementPawn from "./ElementPawn";

export default function LudoBoard({ allTokens, onTokenClick, movableTokenIds }) {
  const cellMap = {};
  COLORS.forEach((color) => {
    allTokens[color].forEach((token) => {
      if (token.state === "base" || token.state === "home") return;
      const rc = getCellRC(token);
      if (!rc) return;
      const key = `${rc[0]}-${rc[1]}`;
      if (!cellMap[key]) cellMap[key] = [];
      cellMap[key].push(token);
    });
  });

  const homeTokens = COLORS.flatMap((c) => allTokens[c].filter((t) => t.state === "home"));
  const baseTokensMap = {};
  COLORS.forEach((c) => {
    baseTokensMap[c] = allTokens[c].filter((t) => t.state === "base");
  });

  const pathSet = new Set(MAIN_PATH.map(([r, c]) => `${r}-${c}`));
  const safeRC = new Set([...SAFE_SPOTS].map((i) => `${MAIN_PATH[i][0]}-${MAIN_PATH[i][1]}`));
  const safeIdx = {};
  [...SAFE_SPOTS].forEach((abs, i) => {
    safeIdx[`${MAIN_PATH[abs][0]}-${MAIN_PATH[abs][1]}`] = i;
  });

  const hsColorMap = {};
  Object.entries(HOME_STRETCHES).forEach(([color, cells]) => {
    cells.forEach(([r, c]) => {
      hsColorMap[`${r}-${c}`] = color;
    });
  });

  const startRC = {};
  Object.entries(START_POS).forEach(([color, idx]) => {
    startRC[`${MAIN_PATH[idx][0]}-${MAIN_PATH[idx][1]}`] = color;
  });
  const specialRC = {};
  Object.entries(SPECIAL_TILE_BY_POS).forEach(([idx, tileType]) => {
    const [r, c] = MAIN_PATH[idx];
    specialRC[`${r}-${c}`] = tileType;
  });

  function renderPathCell(row, col) {
    const key = `${row}-${col}`;
    if (!pathSet.has(key) && !hsColorMap[key]) return null;
    const [x, y] = [col * CELL, row * CELL];
    const tokens = cellMap[key] || [];
    const isSafe = safeRC.has(key);
    const hsColor = hsColorMap[key];
    const startColor = startRC[key];
    const movable = tokens.some((t) => movableTokenIds.includes(`${t.color}-${t.id}`));
    const safeEmojiIdx = safeIdx[key];
    const specialType = specialRC[key];

    let bg = "#1c1917";
    if (hsColor) bg = `${elem(hsColor).dark}55`;
    if (startColor) bg = `${elem(startColor).dark}66`;
    if (isSafe && !startColor) bg = "#292524";

    return (
      <g key={key}>
        <rect x={x} y={y} width={CELL} height={CELL} fill={bg} stroke="#3d3532" strokeWidth="0.6" />
        {hsColor && <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} fill={elem(hsColor).fill} opacity="0.18" rx="3" />}
        {isSafe && !startColor && !tokens.length && (
          <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize="17" style={{ userSelect: "none" }}>
            {SAFE_CELL_EMOJI[safeEmojiIdx % SAFE_CELL_EMOJI.length]}
          </text>
        )}
        {startColor && !tokens.length && (
          <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize="14" style={{ userSelect: "none" }}>
            {elem(startColor).emoji}
          </text>
        )}
        {specialType && !tokens.length && (
          <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize="14" style={{ userSelect: "none" }}>
            {specialType === "death" ? "☠" : specialType === "respawn" ? "↺" : specialType === "plus2" ? "+6" : "-6"}
          </text>
        )}
        {movable && (
          <rect
            x={x + 1.5}
            y={y + 1.5}
            width={CELL - 3}
            height={CELL - 3}
            fill="rgba(255,241,118,0.12)"
            stroke="#fff176"
            strokeWidth="2.5"
            rx="4"
            style={{ animation: "elemPulse 0.85s ease-in-out infinite" }}
          />
        )}
      </g>
    );
  }

  function renderBase(color) {
    const corners = { red: [0, 0], blue: [0, 9], green: [9, 9], yellow: [9, 0] };
    const [br, bc] = corners[color];
    const bx = bc * CELL;
    const by = br * CELL;
    const bsize = 6 * CELL;
    const mid = bsize / 2;
    const e = elem(color);
    const tokens = baseTokensMap[color];

    const slots = [
      [bx + CELL * 1.52, by + CELL * 1.52],
      [bx + CELL * 4.0, by + CELL * 1.52],
      [bx + CELL * 1.52, by + CELL * 4.0],
      [bx + CELL * 4.0, by + CELL * 4.0],
    ];

    return (
      <g key={`base-${color}`}>
        <defs>
          <radialGradient id={`baseGrad-${color}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={e.fill} stopOpacity="0.9" />
            <stop offset="100%" stopColor={e.dark} stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect x={bx} y={by} width={bsize} height={bsize} fill={`url(#baseGrad-${color})`} rx="8" stroke={e.border} strokeWidth="2.5" />
        <rect x={bx + 12} y={by + 12} width={bsize - 24} height={bsize - 24} fill="#0f0f0f" rx="6" opacity="0.7" />
        <rect x={bx + 12} y={by + 12} width={bsize - 24} height={bsize - 24} fill="none" rx="6" stroke={e.fill} strokeWidth="1.5" opacity="0.5" />
        <text x={bx + mid} y={by + mid} textAnchor="middle" dominantBaseline="central" fontSize="52" opacity="0.12" style={{ userSelect: "none", pointerEvents: "none" }}>
          {e.emoji}
        </text>
        <text
          x={bx + mid}
          y={by + mid + 26}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="bold"
          fill={e.fill}
          opacity="0.25"
          letterSpacing="3"
          style={{ userSelect: "none", pointerEvents: "none", fontFamily: "monospace" }}
        >
          {e.name.toUpperCase()}
        </text>
        {slots.map(([sx, sy], i) => {
          const token = tokens.find((t) => t.id === i);
          const isM = token && movableTokenIds.includes(`${color}-${i}`);
          return (
            <g key={i}>
              <circle cx={sx} cy={sy} r={CELL * 0.72} fill="#1a1a1a" stroke={e.dark} strokeWidth="2" />
              <circle cx={sx} cy={sy} r={CELL * 0.58} fill="none" stroke={e.fill} strokeWidth="1" opacity="0.35" />
              {isM && (
                <circle
                  cx={sx}
                  cy={sy}
                  r={CELL * 0.78}
                  fill="none"
                  stroke="#fff176"
                  strokeWidth="2.5"
                  opacity="0.9"
                  style={{ animation: "elemPulse 0.85s ease-in-out infinite" }}
                />
              )}
              {token && <ElementPawn x={sx} y={sy} size={30} color={color} glow={isM} onClick={() => { if (isM) onTokenClick(token); }} clickable={isM} />}
              {!token && (
                <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central" fontSize="16" opacity="0.25" style={{ userSelect: "none" }}>
                  {e.emoji}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  function renderCenter() {
    const x = 6 * CELL;
    const y = 6 * CELL;
    const s = 3 * CELL;
    const mid = s / 2;
    const cx = x + mid;
    const cy = y + mid;

    return (
      <g key="center">
        <rect x={x} y={y} width={s} height={s} fill="#0a0a0a" stroke="#333" strokeWidth="0.5" />
        <polygon points={`${x},${y} ${x + s},${y} ${cx},${cy}`} fill={elem("blue").fill} opacity="0.75" />
        <polygon points={`${x + s},${y} ${x + s},${y + s} ${cx},${cy}`} fill={elem("green").fill} opacity="0.75" />
        <polygon points={`${x + s},${y + s} ${x},${y + s} ${cx},${cy}`} fill={elem("yellow").fill} opacity="0.75" />
        <polygon points={`${x},${y + s} ${x},${y} ${cx},${cy}`} fill={elem("red").fill} opacity="0.75" />
        <text x={cx} y={y + mid * 0.45} textAnchor="middle" dominantBaseline="central" fontSize="11">💧</text>
        <text x={x + s - mid * 0.45} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11">🌪️</text>
        <text x={cx} y={y + s - mid * 0.45} textAnchor="middle" dominantBaseline="central" fontSize="11">🪨</text>
        <text x={x + mid * 0.45} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11">🔥</text>
        <circle cx={cx} cy={cy} r={mid * 0.38} fill="#0f0f0f" stroke="#555" strokeWidth="1" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="24">🌐</text>
        {homeTokens.map((t, i) => {
          const offsets = [[-11, -11], [11, -11], [-11, 11], [11, 11]];
          const [ox, oy] = offsets[i] || [0, 0];
          return <ElementPawn key={`${t.color}-${t.id}`} x={cx + ox} y={cy + oy} size={14} color={t.color} glow={false} clickable={false} />;
        })}
      </g>
    );
  }

  function renderGrid() {
    const lines = [];
    for (let r = 0; r <= 15; r += 1) {
      lines.push(<line key={`h${r}`} x1={0} y1={r * CELL} x2={BOARD} y2={r * CELL} stroke="#2a2520" strokeWidth="0.5" />);
    }
    for (let c = 0; c <= 15; c += 1) {
      lines.push(<line key={`v${c}`} x1={c * CELL} y1={0} x2={c * CELL} y2={BOARD} stroke="#2a2520" strokeWidth="0.5" />);
    }
    return <g>{lines}</g>;
  }

  const allCells = [];
  for (let r = 0; r < 15; r += 1) {
    for (let c = 0; c < 15; c += 1) {
      const key = `${r}-${c}`;
      if (pathSet.has(key) || hsColorMap[key]) allCells.push(renderPathCell(r, c));
    }
  }

  const movingTokens = [];
  Object.values(cellMap).forEach((tokens) => {
    const n = tokens.length;
    const offsets =
      n === 1
        ? [[0, 0]]
        : n === 2
          ? [[-8, 0], [8, 0]]
          : n === 3
            ? [[-8, -5], [8, -5], [0, 7]]
            : [[-7, -7], [7, -7], [-7, 7], [7, 7]];

    tokens.forEach((token, i) => {
      const rc = getCellRC(token);
      if (!rc) return;
      const [row, col] = rc;
      const [ox, oy] = offsets[i] || [0, 0];
      const isMovable = movableTokenIds.includes(`${token.color}-${token.id}`);
      movingTokens.push({
        token,
        x: col * CELL + CELL / 2 + ox,
        y: row * CELL + CELL / 2 + oy,
        size: n > 2 ? 15 : 19,
        isMovable,
      });
    });
  });

  return (
    <svg
      viewBox={`0 0 ${BOARD} ${BOARD}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        maxWidth: "min(96vw,96vh,600px)",
        margin: "0 auto",
        borderRadius: 12,
        boxShadow: "0 0 0 3px #555, 0 0 0 5px #222, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(249,115,22,0.1)",
      }}
    >
      <defs>
        <style>{`
          @keyframes elemPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes elemSpin  { from{transform-origin:50px 50px;transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
        <pattern id="darkBoard" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#1a1614" />
          <rect x="0" y="0" width="3" height="3" fill="#1c1917" opacity="0.6" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={BOARD} height={BOARD} fill="url(#darkBoard)" rx="10" />
      {COLORS.map((color) => renderBase(color))}
      {allCells}
      {movingTokens.map((item) => (
        <g
          key={`${item.token.color}-${item.token.id}`}
          transform={`translate(${item.x}, ${item.y})`}
          style={{ transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        >
          <ElementPawn
            x={0}
            y={0}
            size={item.size}
            color={item.token.color}
            glow={item.isMovable}
            onClick={(event) => {
              event.stopPropagation();
              if (item.isMovable) onTokenClick(item.token);
            }}
            clickable={item.isMovable}
          />
        </g>
      ))}
      {renderGrid()}
      {renderCenter()}
      <rect x="1.5" y="1.5" width={BOARD - 3} height={BOARD - 3} fill="none" rx="10" stroke="#555" strokeWidth="3" />
    </svg>
  );
}
