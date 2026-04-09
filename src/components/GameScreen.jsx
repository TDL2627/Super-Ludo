import Footer from "./Footer";
import LudoBoard from "./LudoBoard";
import PlayerDiceCard from "./PlayerDiceCard";
import useGameLogic from "../hooks/useGameLogic";
import useWindowWidth from "../hooks/useWindowWidth";
import { elem } from "../game/utils";

export default function GameScreen({ players, onRestart }) {
  const playerColors = Object.keys(players);
  const { tokens, currentTurn, diceValue, diceRolled, rolling, movableTokenIds, winner, message, specialToast, rollDice, moveToken } = useGameLogic(players);
  const canRoll = !diceRolled && !rolling && !winner && !players[currentTurn]?.isBot;
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 900;

  const cardProps = (color) => ({
    color,
    name: players[color].name,
    isBot: players[color].isBot,
    tokens: tokens[color],
    isCurrentTurn: currentTurn === color,
    diceValue: currentTurn === color ? diceValue : null,
    rolling: currentTurn === color && rolling,
    canRoll: canRoll && currentTurn === color,
    onRoll: rollDice,
    onTokenClick: moveToken,
    movableTokenIds,
  });

  const leftCols = playerColors.filter((color) => ["red", "yellow"].includes(color));
  const rightCols = playerColors.filter((color) => ["blue", "green"].includes(color));

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(ellipse at 0% 0%, #4a0a0a 0%, transparent 45%), radial-gradient(ellipse at 100% 0%, #0c3a54 0%, transparent 45%), radial-gradient(ellipse at 100% 100%, #1e2a1e 0%, transparent 45%), radial-gradient(ellipse at 0% 100%, #2a1000 0%, transparent 45%), #080808",
      }}
    >
      <style>{`
        @keyframes elemPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes elemSpin  { from{transform-origin:50px 50px;transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes toastInOut {
          0% { opacity: 0; transform: translate(-50%, 20px) scale(0.95); }
          15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          85% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -8px) scale(0.98); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.5)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "transparent",
            fontWeight: 900,
            fontSize: isDesktop ? 20 : 15,
            letterSpacing: 2,
            background: "linear-gradient(90deg,#dc2626,#0ea5e9,#cbd5e1,#92400e)",
            WebkitBackgroundClip: "text",
            whiteSpace: "nowrap",
          }}
        >
          ⚡ ELEMENTAL LUDO
        </span>
        <button
          onClick={onRestart}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
            borderRadius: 8,
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          ↩ New Game
        </button>
      </div>

      {winner && (() => {
        const e = elem(winner);
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.9)", padding: 16 }}>
            <div
              style={{
                background: `linear-gradient(145deg, ${e.dark}cc, #0a0a0a)`,
                borderRadius: 24,
                padding: "32px 24px",
                textAlign: "center",
                boxShadow: `0 0 80px ${e.glow}88, 0 40px 100px rgba(0,0,0,0.8)`,
                border: `2px solid ${e.border}`,
                maxWidth: 340,
                width: "100%",
              }}
            >
              <div style={{ fontSize: 64, marginBottom: 8, filter: `drop-shadow(0 0 20px ${e.glow})` }}>{e.emoji}</div>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px", color: e.border }}>{players[winner]?.name}</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 20, fontSize: 13, letterSpacing: 2 }}>THE {e.name.toUpperCase()} MASTER WINS!</p>
              <button
                onClick={onRestart}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "white",
                  background: `linear-gradient(135deg, ${e.gradFrom}, ${e.gradTo})`,
                  boxShadow: `0 6px 24px ${e.fill}88`,
                }}
              >
                ⚡ Play Again
              </button>
            </div>
          </div>
        );
      })()}

      {specialToast && (
        <div
          key={specialToast.id}
          style={{
            position: "fixed",
            left: "50%",
            top: isDesktop ? 72 : 60,
            transform: "translateX(-50%)",
            zIndex: 120,
            background: "rgba(8,8,8,0.9)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
            animation: "toastInOut 1.7s ease forwards",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 15 }}>{specialToast.icon}</span>
          <span>{specialToast.text}</span>
        </div>
      )}

      {isDesktop ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 8px 52px", gap: 8, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              borderRadius: 12,
              padding: "0 22px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              textAlign: "center",
              width: "100%",
              maxWidth: 640,
              letterSpacing: 0.3,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{message}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 160px", gap: 10, alignItems: "center", width: "100%", maxWidth: 1000 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leftCols.map((color) => <PlayerDiceCard key={color} {...cardProps(color)} />)}
            </div>
            <div style={{ aspectRatio: "1/1", width: "100%", minWidth: 0 }}>
              <LudoBoard allTokens={tokens} onTokenClick={moveToken} movableTokenIds={movableTokenIds} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rightCols.map((color) => <PlayerDiceCard key={color} {...cardProps(color)} />)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {[["🔥💧🌪️🪨", "Safe spots"], ["🏁", "Start"], ["🌐", "Home"], ["✨", "Movable"], ["☠", "Death"], ["↺", "Respawn"], ["+6", "Boost"], ["-6", "Slow"]].map(([icon, label]) => (
              <div key={label} style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 8px 52px", gap: 8, width: "100%", overflowY: "auto" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              borderRadius: 10,
              padding: "0 16px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              textAlign: "center",
              width: "100%",
              letterSpacing: 0.3,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{message}</span>
          </div>

          <div style={{ width: "100%", maxWidth: "min(98vw, 98vw)", aspectRatio: "1/1", flexShrink: 0 }}>
            <LudoBoard allTokens={tokens} onTokenClick={moveToken} movableTokenIds={movableTokenIds} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
            {playerColors.map((color) => (
              <PlayerDiceCard key={color} {...cardProps(color)} compact />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
