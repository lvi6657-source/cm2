import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "../types";

const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 70;
  const l = Math.floor(Math.random() * 20) + 20;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

interface AppState {
  cards: Card[];
  setCards: (val: Card[] | ((prev: Card[]) => Card[])) => void;
  windows: { id: string; name: string }[];
  setWindows: (val: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => void;
  activeWindowId: string;
  setActiveWindowId: (id: string | ((prev: string) => string)) => void;
}

const defaultCards: Card[] = [
  {
    id: crypto.randomUUID(),
    text: "Одиночное нажатие - отметить",
    completed: false,
    createdAt: Date.now(),
    colorClass: getRandomColor(),
    parentId: null,
  },
  {
    id: crypto.randomUUID(),
    text: "Удержание - редактировать",
    completed: false,
    createdAt: Date.now() + 1,
    colorClass: getRandomColor(),
    parentId: null,
  },
  {
    id: crypto.randomUUID(),
    text: "Передвигайте карточки, зажав за любую область",
    completed: false,
    createdAt: Date.now() + 2,
    colorClass: getRandomColor(),
    parentId: null,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cards: defaultCards,
      setCards: (val) => set((state) => ({ cards: typeof val === "function" ? val(state.cards) : val })),
      windows: [{ id: "w1", name: "L1" }],
      setWindows: (val) => set((state) => ({ windows: typeof val === "function" ? val(state.windows) : val })),
      activeWindowId: "w1",
      setActiveWindowId: (val) => set((state) => ({ activeWindowId: typeof val === "function" ? val(state.activeWindowId) : val })),
    }),
    {
      name: "memory-app-storage",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Add migration logic if needed
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
           // Provide a mechanism to break cycles just in case
           const visited = new Set<string>();
           const path = new Set<string>();
           const cards = [...(state.cards || [])];
           
           const checkCycle = (id: string) => {
             if (path.has(id)) return true; // Cycle detected
             if (visited.has(id)) return false; // Already checked
             visited.add(id);
             path.add(id);
             const card = cards.find((c) => c.id === id);
             if (card && card.parentId) {
               if (checkCycle(card.parentId)) {
                 card.parentId = null;
               }
             }
             path.delete(id);
             return false;
           };
           cards.forEach((c) => checkCycle(c.id));
           state.setCards(cards);
        }
        
        // Also perform old data migration
        if (!localStorage.getItem("memory-app-storage")) {
          const oldCards = localStorage.getItem("memoryCards");
          if (oldCards) {
            try {
               let parsed = JSON.parse(oldCards);
               state?.setCards(parsed);
               const oldWindows = localStorage.getItem("memoryWindows");
               if (oldWindows) state?.setWindows(JSON.parse(oldWindows));
               const oldActiveWin = localStorage.getItem("memoryActiveWindow");
               if (oldActiveWin) state?.setActiveWindowId(oldActiveWin);
            } catch(e) {}
          }
        }
      }
    }
  )
);
