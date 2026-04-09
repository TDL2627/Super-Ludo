import { COLOR_TO_ELEM, DICE_DOTS, ELEM_DICE_DOT } from "../game/constants";
import { elem } from "../game/utils";

export default function ElementDice({ value, rolling, onClick, disabled, color, size = 64 }) {
  const e = elem(color);
  const dotEmoji = ELEM_DICE_DOT[COLOR_TO_ELEM[color]];
  const fontSize = size * 0.22;

  return (
    <button
      onClick={onClick}
      disabled={disabled || rolling}
      title={disabled ? "Wait your turn" : "Click to roll!"}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        padding: 0,
        border: `2.5px solid ${e.border}`,
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
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(event) => {
        if (!disabled && !rolling) event.currentTarget.style.transform = "scale(1.12) rotate(-3deg)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 30% 30%, ${e.fill}33, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ display: "block", animation: rolling ? "elemSpin 0.15s linear infinite" : "none" }}
      >
        {(DICE_DOTS[value || 1] || []).map(([cx, cy], index) => (
          <text
            key={index}
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize * 4.2}
            style={{ userSelect: "none" }}
          >
            {dotEmoji}
          </text>
        ))}
      </svg>
    </button>
  );
}
