import { elem } from "../game/utils";

export default function ElementPawn({ x, y, size, color, glow, onClick, clickable }) {
  const e = elem(color);
  const s = size;

  return (
    <g onClick={onClick} style={{ cursor: clickable ? "pointer" : "default" }}>
      {glow && (
        <circle
          cx={x}
          cy={y}
          r={s * 0.82}
          fill={e.fill}
          opacity="0.2"
          style={{ animation: "elemPulse 0.85s ease-in-out infinite" }}
        />
      )}
      <ellipse cx={x} cy={y + s * 0.42} rx={s * 0.44} ry={s * 0.13} fill="#000" opacity="0.35" />
      <ellipse cx={x} cy={y + s * 0.35} rx={s * 0.4} ry={s * 0.12} fill={e.dark} opacity="0.85" />
      <path
        d={`M${x - s * 0.22},${y + s * 0.28}
                Q${x - s * 0.3},${y + s * 0.04} ${x - s * 0.15},${y - s * 0.06}
                Q${x - s * 0.09},${y - s * 0.14} ${x},${y - s * 0.14}
                Q${x + s * 0.09},${y - s * 0.14} ${x + s * 0.15},${y - s * 0.06}
                Q${x + s * 0.3},${y + s * 0.04} ${x + s * 0.22},${y + s * 0.28} Z`}
        fill={e.fill}
        stroke={e.dark}
        strokeWidth="1.2"
      />
      <circle cx={x} cy={y - s * 0.26} r={s * 0.21} fill={e.fill} stroke={e.dark} strokeWidth="1.2" />
      <circle cx={x - s * 0.07} cy={y - s * 0.33} r={s * 0.07} fill="white" opacity="0.55" />
      <text
        x={x}
        y={y + s * 0.12}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={s * 0.28}
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {e.emoji}
      </text>
      {glow && (
        <ellipse
          cx={x}
          cy={y + s * 0.35}
          rx={s * 0.46}
          ry={s * 0.15}
          fill="none"
          stroke="#fff176"
          strokeWidth="2.2"
          opacity="0.9"
          style={{ animation: "elemPulse 0.85s ease-in-out infinite" }}
        />
      )}
    </g>
  );
}
