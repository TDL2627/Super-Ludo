import ElementDice from "./ElementDice";
import { elem } from "../game/utils";

export default function PlayerDiceCard({
  color,
  name,
  isBot,
  tokens,
  isCurrentTurn,
  diceValue,
  rolling,
  canRoll,
  onRoll,
  onTokenClick,
  movableTokenIds,
  compact = false,
}) {
  const e = elem(color);
  const atHome = tokens.filter((t) => t.state === "home").length;
  const isMovableToken = (token) => movableTokenIds.includes(`${color}-${token.id}`);
  const diceSize = compact ? 40 : 52;
  const pad = compact ? "8px 10px" : "12px 14px";
  const nameSize = compact ? 12 : 13;
  const subSize = compact ? 9 : 10;
  const pipSize = compact ? 14 : 18;
  const emojiSize = compact ? 17 : 22;
  const gap = compact ? 6 : 8;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `2px solid ${isCurrentTurn ? e.border : "rgba(255,255,255,0.08)"}`,
        background: isCurrentTurn ? `linear-gradient(145deg, ${e.dark}99, #0f0f0f)` : "rgba(15,15,15,0.8)",
        transition: "all 0.3s",
        transform: isCurrentTurn ? "scale(1.02)" : "scale(1)",
        boxShadow: isCurrentTurn ? `0 0 20px ${e.glow}55, 0 6px 24px rgba(0,0,0,0.6)` : "0 2px 10px rgba(0,0,0,0.4)",
        padding: pad,
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isCurrentTurn && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            background: `radial-gradient(ellipse at 50% 0%, ${e.fill}, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap, marginBottom: compact ? 6 : 10 }}>
        <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{e.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: nameSize,
              color: isCurrentTurn ? e.border : "rgba(255,255,255,0.8)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: subSize, color: e.fill, opacity: 0.8, fontWeight: 600, letterSpacing: 1 }}>
            {e.name.toUpperCase()}
            {isBot && " · BOT"}
          </div>
        </div>
        {isCurrentTurn && (
          <span style={{ fontSize: 9, color: e.border, animation: "elemPulse 0.85s ease-in-out infinite", whiteSpace: "nowrap" }}>
            ▶ TURN
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: compact ? 3 : 4, marginBottom: compact ? 6 : 10, alignItems: "center" }}>
        {tokens.map((token) => (
          <div
            key={token.id}
            onClick={() => (isMovableToken(token) ? onTokenClick(token) : null)}
            style={{
              width: pipSize,
              height: pipSize,
              borderRadius: "50%",
              background: token.state === "base" ? "#333" : e.fill,
              opacity: token.state === "base" ? 0.3 : 1,
              border: isMovableToken(token) ? "2px solid #fff176" : `1.5px solid ${e.dark}`,
              cursor: isMovableToken(token) ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: compact ? 7 : 9,
              boxShadow: token.state === "home" ? `0 0 6px ${e.glow}` : "none",
              animation: isMovableToken(token) ? "elemPulse 0.85s ease-in-out infinite" : "none",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            {token.state !== "base" && <span style={{ color: "white", fontWeight: 700 }}>{e.emoji[0]}</span>}
          </div>
        ))}
        <span style={{ fontSize: subSize, color: "rgba(255,255,255,0.4)", marginLeft: "auto", whiteSpace: "nowrap" }}>{atHome}/4 🏠</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 10 }}>
        <ElementDice
          value={isCurrentTurn ? (diceValue || 1) : 1}
          rolling={isCurrentTurn && rolling}
          onClick={onRoll}
          disabled={!canRoll || !isCurrentTurn}
          color={color}
          size={diceSize}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {isCurrentTurn && diceValue ? (
            <div style={{ color: e.border, fontWeight: 700, fontSize: compact ? 12 : 14 }}>
              Rolled: <span style={{ fontSize: compact ? 17 : 20 }}>{diceValue}</span>
            </div>
          ) : isCurrentTurn ? (
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: compact ? 10 : 11 }}>{canRoll ? (isBot ? "Rolling..." : "Tap dice!") : "Choose pawn"}</div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: compact ? 10 : 11 }}>Waiting…</div>
          )}
        </div>
      </div>
    </div>
  );
}
