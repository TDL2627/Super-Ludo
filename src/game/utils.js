import { COLOR_TO_ELEM, COLORS, ELEMENTS, HOME_STRETCHES, MAIN_PATH, SAFE_SPOTS, START_POS } from "./constants";

export function elem(color) {
  return ELEMENTS[COLOR_TO_ELEM[color]];
}

export function getRelativePos(color, absPos) {
  return (absPos - START_POS[color] + 52) % 52;
}

export function getAbsolutePos(color, relPos) {
  return (START_POS[color] + relPos) % 52;
}

export function isAtSafeSpot(absPos) {
  return SAFE_SPOTS.has(absPos);
}

export function getCellRC(token) {
  if (token.state === "base" || token.state === "home") return null;
  if (token.state === "homestretch") return HOME_STRETCHES[token.color][token.homeStretchPos];
  return MAIN_PATH[token.absPos];
}

export function createInitialTokens() {
  const tokens = {};
  COLORS.forEach((color) => {
    tokens[color] = [0, 1, 2, 3].map((id) => ({
      id,
      color,
      state: "base",
      absPos: null,
      relPos: null,
      homeStretchPos: null,
    }));
  });
  return tokens;
}
