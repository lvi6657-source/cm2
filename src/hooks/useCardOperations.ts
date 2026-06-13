import { Card } from '../types';
import { getRandomColor, darkenHsl, getDependentIds } from '../utils';

export const useCardOperations = (
  cards: Card[],
  setCards: any,
  currentParentIdRef: any,
  windowIdRef: any,
  setEditingCardId: any,
  currentParentId?: any,
  setCurrentParentId?: any,
  isTrashView?: any
) => {

  const addCard = (text: string) => {
    if (!text.trim()) return;
    setCards((prev: Card[]) => {
      let color = getRandomColor();
      if (currentParentIdRef.current) {
        const parentCard = prev.find((c: Card) => c.id === currentParentIdRef.current);
        if (parentCard && parentCard.colorClass) {
          color = darkenHsl(parentCard.colorClass, 3);
        }
      }

      const newCard: Card = {
        id: crypto.randomUUID(),
        text: text.trim(),
        completed: false,
        createdAt: Date.now(),
        colorClass: color,
        parentId: currentParentIdRef.current,
        windowId: windowIdRef.current,
        
      };

      const newArr = [newCard, ...prev];
      return newArr.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
        return 0;
      });
    });
  };

  const toggleCardState = (id: string) => {
    if ("vibrate" in navigator) navigator.vibrate(50);
    setCards((prev: Card[]) => {
      return prev.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c,
      );
    });

    setTimeout(() => {
      setCards((prev: Card[]) => {
        const sorted = [...prev].sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
          return 0;
        });
        return sorted;
      });
    }, 3000);
  };

  const updateCard = (id: string, updates: Partial<Card>) => {
    setCards((prev: Card[]) => {
      let next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      
      if (updates.colorClass) {
        const queue = [{ id, color: updates.colorClass }];
        while(queue.length > 0) {
          const { id: parentId, color: parentColor } = queue.shift()!;
          const children = next.filter(c => c.parentId === parentId);
          for (const child of children) {
            const childColor = darkenHsl(parentColor, 3);
            next = next.map(c => c.id === child.id ? { ...c, colorClass: childColor } : c);
            queue.push({ id: child.id, color: childColor });
          }
        }
      }
      return next;
    });
  };

  const deleteCard = (id: string) => {
    setCards((prev: Card[]) => {
      const idsToRemove = getDependentIds([id], prev);
      if (currentParentId && idsToRemove.has(currentParentId)) {
        setTimeout(() => {
          setCurrentParentId((prevId: any) => {
            if (!prevId) return prevId;
             const p = prev.find((c: Card) => c.id === prevId);
             return p?.parentId || null;
          });
        }, 0);
      }
      if (isTrashView) {
        return prev.filter((c: Card) => !idsToRemove.has(c.id));
      }
      return prev.map((c: Card) => idsToRemove.has(c.id) ? { ...c, isDeleted: true } : c);
    });
  };

  return { addCard, updateCard, deleteCard, toggleCardState };
};
