export const ELEMENTS = {
  fire: {
    color: "red",
    name: "Fire",
    emoji: "🔥",
    symbol: "♨",
    fill: "#dc2626",
    light: "#fef2f2",
    dark: "#991b1b",
    border: "#f87171",
    glow: "#ef4444",
    gradFrom: "#dc2626",
    gradTo: "#ef4444",
    baseBg: "linear-gradient(145deg,#7f1d1d,#991b1b)",
    particleColor: "#fca5a5",
    pawnHead: "🔥",
  },
  water: {
    color: "blue",
    name: "Water",
    emoji: "💧",
    symbol: "∿",
    fill: "#0ea5e9",
    light: "#f0f9ff",
    dark: "#075985",
    border: "#38bdf8",
    glow: "#0ea5e9",
    gradFrom: "#0284c7",
    gradTo: "#0ea5e9",
    baseBg: "linear-gradient(145deg,#0c4a6e,#0369a1)",
    particleColor: "#7dd3fc",
    pawnHead: "💧",
  },
  air: {
    color: "green",
    name: "Air",
    emoji: "🌪️",
    symbol: "≋",
    fill: "#cbd5e1",
    light: "#f8fafc",
    dark: "#64748b",
    border: "#e2e8f0",
    glow: "#94a3b8",
    gradFrom: "#94a3b8",
    gradTo: "#cbd5e1",
    baseBg: "linear-gradient(145deg,#1e293b,#334155)",
    particleColor: "#f1f5f9",
    pawnHead: "🌪️",
  },
  earth: {
    color: "yellow",
    name: "Earth",
    emoji: "🪨",
    symbol: "⬡",
    fill: "#92400e",
    light: "#fef3c7",
    dark: "#451a03",
    border: "#a16207",
    glow: "#78350f",
    gradFrom: "#78350f",
    gradTo: "#92400e",
    baseBg: "linear-gradient(145deg,#1c0a00,#3b1a06)",
    particleColor: "#d97706",
    pawnHead: "🪨",
  },
};

export const ELEM_ORDER = ["fire", "water", "air", "earth"];
export const COLOR_TO_ELEM = { red: "fire", blue: "water", green: "air", yellow: "earth" };
export const COLORS = ["red", "blue", "green", "yellow"];

export const CELL = 40;
export const BOARD = 600;

export const MAIN_PATH = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

export const HOME_STRETCHES = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  blue: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  green: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

export const START_POS = { red: 1, blue: 14, green: 27, yellow: 40 };
export const SAFE_SPOTS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);
export const SAFE_CELL_EMOJI = ["🔥", "💧", "🌪️", "🪨", "🔥", "💧", "🌪️", "🪨"];

export const DICE_DOTS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

export const ELEM_DICE_DOT = { fire: "🔥", water: "💧", air: "🌀", earth: "🍂" };
