const fs = require('fs');

let t = fs.readFileSync('src/App.tsx', 'utf8');

const getBlock = (startMatch, endMatch) => {
  const start = t.indexOf(startMatch);
  const end = t.indexOf(endMatch, start) + endMatch.length;
  const block = t.slice(start, end);
  t = t.slice(0, start) + t.slice(end);
  return block;
};

const addCardBlock = getBlock('  const addCard = useCallback((text: string) => {', '  }, []);\n');
const updateBlock = getBlock('  const updateCard = useCallback((id: string, updates: Partial<Card>) => {', '  }, [setCards, cards]);\n');
const delBlock = getBlock('  const deleteCard = useCallback((id: string) => {', '  }, [cards, setCards, setEditingCardId]);\n');
const togBlock = getBlock('  const toggleCardState = useCallback((id: string) => {', '  }, [cards, setCards]);\n');

const out = `import { useCallback } from "react";
import { Card } from "../types";
import { getRandomColor, darkenHsl, getDependentIds } from "../utils";

export const useCardOperations = (
  cards: Card[],
  setCards: any,
  currentParentIdRef: any,
  windowIdRef: any,
  setEditingCardId: any
) => {
${addCardBlock}
${updateBlock}
${delBlock}
${togBlock}
  return { addCard, updateCard, deleteCard, toggleCardState };
};
`;

fs.writeFileSync('src/hooks/useCardOperations.ts', out);

t = t.replace('import { useCardDnd } from "./hooks/useCardDnd";', 'import { useCardDnd } from "./hooks/useCardDnd";\nimport { useCardOperations } from "./hooks/useCardOperations";');
t = t.replace('  const { cards, setCards, windows, setWindows, activeWindowId, setActiveWindowId } = useAppStore();\n', '  const { cards, setCards, windows, setWindows, activeWindowId, setActiveWindowId } = useAppStore();\n  const { addCard, updateCard, deleteCard, toggleCardState } = useCardOperations(cards, setCards, currentParentIdRef, windowIdRef, setEditingCardId);\n');

fs.writeFileSync('src/App.tsx', t);
console.log('done');
