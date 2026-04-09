export default function Footer() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        textAlign: "center",
        padding: "8px 16px",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: 600,
          background: "linear-gradient(90deg,#dc2626,#0ea5e9,#cbd5e1,#92400e)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textTransform: "uppercase",
        }}
      >
        © {new Date().getFullYear()} TDL2627 · All Rights Reserved
      </span>
    </div>
  );
}
