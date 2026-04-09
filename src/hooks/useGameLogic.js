import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, SPECIAL_TILE_BY_POS, START_POS } from "../game/constants";
import { createInitialTokens, elem, getAbsolutePos, getRelativePos, isAtSafeSpot } from "../game/utils";

export default function useGameLogic(players) {
  const playerColors = Object.keys(players);
  const [tokens, setTokens] = useState(createInitialTokens);
  const [currentTurn, setCurrentTurn] = useState(playerColors[0]);
  const [diceValue, setDiceValue] = useState(null);
  const [diceRolled, setDiceRolled] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [movableTokenIds, setMovableTokenIds] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("🌍 Roll to awaken the elements!");
  const [specialToast, setSpecialToast] = useState(null);
  const botRef = useRef(null);
  const toastRef = useRef(null);

  const showSpecialToast = useCallback((type, text) => {
    const iconMap = { death: "☠", respawn: "↺", plus2: "+6", minus2: "-6" };
    setSpecialToast({
      id: `${Date.now()}-${Math.random()}`,
      type,
      text,
      icon: iconMap[type] || "✨",
    });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => {
      setSpecialToast(null);
    }, 1700);
  }, []);

  const nextTurn = useCallback((currentColor, gotSix) => {
    if (gotSix) {
      setDiceValue(null);
      setDiceRolled(false);
      setMovableTokenIds([]);
      setMessage(`${elem(currentColor).emoji} ${players[currentColor]?.name} rolled 6 — roll again!`);
      return;
    }
    const idx = playerColors.indexOf(currentColor);
    const next = playerColors[(idx + 1) % playerColors.length];
    setCurrentTurn(next);
    setDiceValue(null);
    setDiceRolled(false);
    setMovableTokenIds([]);
    setMessage(`${elem(next).emoji} ${players[next]?.name}'s turn!`);
  }, [playerColors, players]);

  const computeMovable = useCallback((color, roll, allTokens) => {
    return allTokens[color].reduce((acc, t) => {
      if (t.state === "home") return acc;
      if (t.state === "base") {
        if (roll === 6) acc.push(`${color}-${t.id}`);
        return acc;
      }
      if (t.state === "homestretch") {
        if (t.homeStretchPos + roll <= 5) acc.push(`${color}-${t.id}`);
        return acc;
      }
      if (getRelativePos(color, t.absPos) + roll <= 57) acc.push(`${color}-${t.id}`);
      return acc;
    }, []);
  }, []);

  const rollDice = useCallback(() => {
    if (rolling || diceRolled) return;
    setRolling(true);
    let count = 0;
    const intervalId = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      count += 1;
      if (count >= 8) {
        clearInterval(intervalId);
        const final = Math.ceil(Math.random() * 6);
        setDiceValue(final);
        setRolling(false);
        setDiceRolled(true);
        setTokens((prev) => {
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
    setTokens((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const t = next[token.color][token.id];
      let gotSix = diceValue === 6;
      let movedHome = false;
      let captured = false;

      if (t.state === "base") {
        t.state = "active";
        t.absPos = START_POS[token.color];
        t.relPos = 0;
      } else if (t.state === "homestretch") {
        t.homeStretchPos += diceValue;
        if (t.homeStretchPos >= 5) {
          t.state = "home";
          t.homeStretchPos = 5;
          movedHome = true;
          gotSix = false;
        }
      } else {
        const rel = getRelativePos(token.color, t.absPos);
        const newRel = rel + diceValue;
        if (newRel >= 52) {
          const hp = newRel - 52;
          t.homeStretchPos = Math.min(hp, 5);
          t.state = hp >= 5 ? "home" : "homestretch";
          t.absPos = null;
          if (t.state === "home") {
            movedHome = true;
            gotSix = false;
          }
        } else {
          const newAbs = getAbsolutePos(token.color, newRel);
          t.absPos = newAbs;
          t.relPos = newRel;
          if (!isAtSafeSpot(newAbs)) {
            COLORS.forEach((c) => {
              if (c === token.color || !players[c]) return;
              next[c].forEach((ot) => {
                if (ot.state === "active" && ot.absPos === newAbs) {
                  ot.state = "base";
                  ot.absPos = null;
                  ot.relPos = null;
                  captured = true;
                  setMessage(`${elem(token.color).emoji} ${players[token.color]?.name} captured ${elem(c).emoji} ${players[c]?.name}!`);
                }
              });
            });
          }
        }
      }

      const applyCaptureAtPosition = (movingColor, absPos) => {
        let didCapture = false;
        if (isAtSafeSpot(absPos)) return didCapture;
        COLORS.forEach((color) => {
          if (color === movingColor || !players[color]) return;
          next[color].forEach((ot) => {
            if (ot.state === "active" && ot.absPos === absPos) {
              ot.state = "base";
              ot.absPos = null;
              ot.relPos = null;
              didCapture = true;
              setMessage(`${elem(movingColor).emoji} ${players[movingColor]?.name} captured ${elem(color).emoji} ${players[color]?.name}!`);
            }
          });
        });
        return didCapture;
      };

      const moveActiveBy = (movingToken, delta) => {
        if (movingToken.state !== "active") return;
        const rel = getRelativePos(movingToken.color, movingToken.absPos);
        const nextRel = rel + delta;
        if (nextRel < 0) {
          movingToken.absPos = getAbsolutePos(movingToken.color, 0);
          movingToken.relPos = 0;
          return;
        }
        if (nextRel >= 52) {
          const hp = nextRel - 52;
          movingToken.homeStretchPos = Math.min(hp, 5);
          movingToken.state = hp >= 5 ? "home" : "homestretch";
          movingToken.absPos = null;
          movingToken.relPos = null;
          return;
        }
        movingToken.absPos = getAbsolutePos(movingToken.color, nextRel);
        movingToken.relPos = nextRel;
      };

      if (t.state === "active") {
        const tileType = SPECIAL_TILE_BY_POS[t.absPos];
        if (tileType === "death") {
          t.state = "base";
          t.absPos = null;
          t.relPos = null;
          setMessage(`${elem(token.color).emoji} ${players[token.color]?.name} hit a death tile and went back to base.`);
          showSpecialToast("death", "Death tile! Pawn sent to base");
        }
        if (tileType === "respawn") {
          const respawnToken = next[token.color].find((item) => item.state === "base");
          if (respawnToken) {
            respawnToken.state = "active";
            respawnToken.absPos = START_POS[token.color];
            respawnToken.relPos = 0;
            const gotRespawnCapture = applyCaptureAtPosition(token.color, respawnToken.absPos);
            if (gotRespawnCapture) captured = true;
            setMessage(`${elem(token.color).emoji} ${players[token.color]?.name} respawned a pawn from base.`);
            showSpecialToast("respawn", "Respawn tile! One pawn returned");
          }
        }
        if (tileType === "plus2") {
          moveActiveBy(t, 6);
          if (t.state === "active") {
            const gotPlusCapture = applyCaptureAtPosition(token.color, t.absPos);
            if (gotPlusCapture) captured = true;
          } else if (t.state === "home") {
            movedHome = true;
            gotSix = false;
          }
          setMessage(`${elem(token.color).emoji} ${players[token.color]?.name} got +6 bonus move.`);
          showSpecialToast("plus2", "+6 tile! Bonus forward move");
        }
        if (tileType === "minus2") {
          moveActiveBy(t, -6);
          if (t.state === "active") {
            const gotMinusCapture = applyCaptureAtPosition(token.color, t.absPos);
            if (gotMinusCapture) captured = true;
          }
          setMessage(`${elem(token.color).emoji} ${players[token.color]?.name} got -6 move penalty.`);
          showSpecialToast("minus2", "-6 tile! Step back");
        }
      }

      const allHome = next[token.color].every((item) => item.state === "home");
      if (allHome) {
        setWinner(token.color);
        setMovableTokenIds([]);
        return next;
      }

      if (movedHome) setMessage(`${elem(token.color).emoji} Warrior reached the portal!`);
      setMovableTokenIds([]);
      setTimeout(() => nextTurn(token.color, gotSix || captured), 300);
      return next;
    });
  }, [movableTokenIds, diceValue, nextTurn, players]);

  useEffect(() => {
    if (!players[currentTurn]?.isBot || diceRolled || winner) return;
    botRef.current = setTimeout(rollDice, 1300);
    return () => clearTimeout(botRef.current);
  }, [currentTurn, diceRolled, players, winner, rollDice]);

  useEffect(() => {
    if (!players[currentTurn]?.isBot || !diceRolled || !movableTokenIds.length || winner) return;
    botRef.current = setTimeout(() => {
      const myT = tokens[currentTurn];
      let best = null;
      let bestScore = -1;
      movableTokenIds.forEach((tokenId) => {
        const id = parseInt(tokenId.split("-")[1], 10);
        const t = myT[id];
        let score = 0;
        if (t.state === "base") {
          score = 10;
        } else if (t.state === "homestretch") {
          score = 50 + t.homeStretchPos;
        } else {
          const rel = getRelativePos(currentTurn, t.absPos);
          score = 20 + rel;
          const newRel = rel + diceValue;
          if (newRel < 52) {
            const newAbs = getAbsolutePos(currentTurn, newRel);
            if (!isAtSafeSpot(newAbs)) {
              COLORS.forEach((enemyColor) => {
                if (enemyColor === currentTurn || !players[enemyColor]) return;
                tokens[enemyColor].forEach((ot) => {
                  if (ot.state === "active" && ot.absPos === newAbs) score += 100;
                });
              });
            }
          }
        }
        if (score > bestScore) {
          bestScore = score;
          best = t;
        }
      });
      if (best) moveToken(best);
    }, 950);
    return () => clearTimeout(botRef.current);
  }, [diceRolled, movableTokenIds, currentTurn, tokens, diceValue, players, winner, moveToken]);

  useEffect(() => {
    return () => {
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  return { tokens, currentTurn, diceValue, diceRolled, rolling, movableTokenIds, winner, message, specialToast, rollDice, moveToken };
}
