import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, START_POS } from "../game/constants";
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
  const botRef = useRef(null);

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

  return { tokens, currentTurn, diceValue, diceRolled, rolling, movableTokenIds, winner, message, rollDice, moveToken };
}
