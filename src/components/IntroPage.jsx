import { useState } from "react";
import { COLORS, ELEMENTS, ELEM_ORDER } from "../game/constants";
import { elem } from "../game/utils";
import Footer from "./Footer";

export default function IntroPage({ onStart }) {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState({ red: "Ignis", blue: "Aqua", green: "Zephyr", yellow: "Terra" });
  const [bots, setBots] = useState({ red: false, blue: false, green: true, yellow: true });
  const elemColors = COLORS.slice(0, count);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
        background:
          "radial-gradient(ellipse at 0% 0%, #4a0a0a 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, #0c3a54 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, #1e2a1e 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, #2a1000 0%, transparent 50%), #0a0a0a",
        fontFamily: "'Georgia','Times New Roman',serif",
      }}
    >
      <style>{`
        @keyframes elemFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-12px) scale(1.05)} }
        @keyframes elemPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>

      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            {ELEM_ORDER.map((el, i) => (
              <div
                key={el}
                style={{
                  fontSize: 38,
                  display: "inline-block",
                  animation: `elemFloat 1.4s ${i * 0.22}s ease-in-out infinite`,
                  filter: `drop-shadow(0 0 8px ${ELEMENTS[el].glow})`,
                }}
              >
                {ELEMENTS[el].emoji}
              </div>
            ))}
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              margin: "0 0 6px",
              letterSpacing: -4,
              lineHeight: 1,
              background: "linear-gradient(135deg,#dc2626 0%,#0ea5e9 35%,#cbd5e1 65%,#92400e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LUDO
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", letterSpacing: 5, fontSize: 10, textTransform: "uppercase" }}>Elements Edition</p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: 28,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 28px 80px rgba(0,0,0,0.7)",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>SELECT WARRIORS</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  transition: "all 0.2s",
                  background: count === n ? "linear-gradient(135deg,#f97316,#d97706)" : "rgba(255,255,255,0.1)",
                  color: "white",
                  transform: count === n ? "scale(1.06)" : "scale(1)",
                  boxShadow: count === n ? "0 4px 16px rgba(249,115,22,0.5)" : "none",
                }}
              >
                {n}P
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {elemColors.map((color) => {
              const e = elem(color);
              return (
                <div
                  key={color}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: `linear-gradient(135deg, ${e.dark}44, transparent)`,
                    borderRadius: 12,
                    padding: "8px 10px",
                    border: `1px solid ${e.fill}33`,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `radial-gradient(circle at 40% 35%, ${e.fill}, ${e.dark})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      boxShadow: `0 2px 12px ${e.fill}66`,
                    }}
                  >
                    {e.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      type="text"
                      value={names[color]}
                      disabled={bots[color]}
                      onChange={(event) => setNames((prev) => ({ ...prev, [color]: event.target.value }))}
                      placeholder={bots[color] ? `${e.name} Bot` : e.name}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: 13,
                        background: "rgba(255,255,255,0.1)",
                        border: `1px solid ${e.fill}44`,
                        color: "white",
                        outline: "none",
                        opacity: bots[color] ? 0.5 : 1,
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ fontSize: 10, color: e.fill, opacity: 0.7, marginTop: 2, letterSpacing: 1 }}>{e.name.toUpperCase()} ELEMENT</div>
                  </div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={bots[color]}
                      onChange={(event) => setBots((prev) => ({ ...prev, [color]: event.target.checked }))}
                      style={{ accentColor: e.fill, width: 14, height: 14 }}
                    />
                    Bot
                  </label>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              const p = {};
              elemColors.forEach((color) => {
                const e = elem(color);
                p[color] = {
                  name: bots[color] ? `${e.name} Bot` : names[color] || e.name,
                  isBot: bots[color],
                  color,
                };
              });
              onStart(p);
            }}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 16,
              color: "white",
              letterSpacing: 1.5,
              background: "linear-gradient(90deg,#dc2626,#0ea5e9,#cbd5e1,#92400e)",
              boxShadow: "0 6px 28px rgba(0,0,0,0.5)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "scale(1.04)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "scale(1)";
            }}
          >
            ⚡ Summon Warriors!
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
