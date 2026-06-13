const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const getBlock = (startRegex, endRegex) => {
  const start = app.match(startRegex);
  if (!start) return null;
  const rest = app.slice(start.index);
  const end = rest.match(endRegex);
  if (!end) return null;
  const block = rest.slice(0, end.index + end[0].length);
  app = app.replace(block, '');
  return block;
};

// We will skip fully extracting useVoice since the logic is intertwined with a lot of state variables (like setInputText, setSearchQuery, isAddingNote, isSearchActive, addCard). 
// Instead, let's extract Card Operations to src/hooks/useCardOperations.ts

const addCardBlock = getBlock(/  const addCard = useCallback\(\(text: string\) => \{/, /    \}\);\n  \}, \[\]\);\n/);
const toggleCardStateBlock = getBlock(/  const toggleCardState = useCallback\(\(id: string\) => \{/, /  \}, \[cards, setCards\]\);\n/);
const updateCardBlock = getBlock(/  const updateCard = useCallback\(\(id: string, updates: Partial<Card>\) => \{/, /  \}, \[setCards, cards\]\);\n/);
const deleteCardBlock = getBlock(/  const deleteCard = useCallback\(\(id: string\) => \{/, /  \}, \[cards, setCards, setEditingCardId\]\);\n/);

console.log(!!addCardBlock, !!toggleCardStateBlock, !!updateCardBlock, !!deleteCardBlock);

const code = `import { useCallback } from 'react';
import { Card } from '../types';
import { getRandomColor, darkenHsl, getDependentIds } from '../utils';

export const useCardOperations = (
  cards: Card[],
  setCards: any,
  currentParentIdRef: any,
  windowIdRef: any,
  setEditingCardId: any
) => {
${addCardBlock || ''}
${updateCardBlock || ''}
${deleteCardBlock || ''}
${toggleCardStateBlock || ''}
  return { addCard, updateCard, deleteCard, toggleCardState };
};
`;

fs.writeFileSync('src/hooks/useCardOperations.ts', code);

// Inject import
app = app.replace('import { useCardDnd }', 'import { useCardDnd }\nimport { useCardOperations } from "./hooks/useCardOperations";');

// Inject hook call right after useAppStore
app = app.replace(/const \{ cards, setCards.*?\n/, `$&  const { addCard, updateCard, deleteCard, toggleCardState } = useCardOperations(cards, setCards, currentParentIdRef, windowIdRef, setEditingCardId);\n`);

fs.writeFileSync('src/App.tsx', app);
