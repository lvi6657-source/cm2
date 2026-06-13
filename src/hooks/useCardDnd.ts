import { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const useCardDnd = (setCards: any, currentParentId: string | null, activeWindowId: string, setActiveId: any, setOverId: any, setDragOffset: any) => {
  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); setOverId(event.active.id as string); setDragOffset(0); };
  const handleDragMove = (event: DragMoveEvent) => { setDragOffset(event.delta.x); setOverId((event.over?.id as string) || null); };
  const handleDragCancel = () => { setActiveId(null); setOverId(null); setDragOffset(0); };
  const handleDragEnd = (event: DragEndEvent) => { const { active, over } = event; if (over && active.id !== over.id) { setCards((prev: any) => { let subList = prev.filter((c: any) => { if (currentParentId) return c.parentId === currentParentId; return (c.parentId === null && (c.windowId || 'w1') === activeWindowId); }).sort((a: any, b: any) => {  if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1; return 0; }); const oldIndex = subList.findIndex((item: any) => item.id === active.id); const newIndex = subList.findIndex((item: any) => item.id === over.id); subList = arrayMove(subList, oldIndex, newIndex); subList.sort((a: any, b: any) => {  if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1; return 0; }); return [...prev.filter((c: any) => { if (currentParentId) return c.parentId !== currentParentId; return !(c.parentId === null && (c.windowId || 'w1') === activeWindowId); }), ...subList]; }); } setActiveId(null); setOverId(null); setDragOffset(0); };
  return { handleDragStart, handleDragMove, handleDragEnd, handleDragCancel };
};