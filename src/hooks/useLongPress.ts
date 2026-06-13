import React, { useCallback, useRef } from 'react';

export function useLongPress({
  onLongPressReady,
  onLongPress,
  onLongPressEnd,
  onClick,
  onDoubleClick,
  ms = 400,
  vibrate = true,
  filter,
}: {
  onLongPressReady?: () => void;
  onLongPress: (e: React.PointerEvent) => void;
  onLongPressEnd?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  ms?: number;
  vibrate?: boolean;
  filter?: (e: React.PointerEvent | React.MouseEvent) => boolean;
}) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);
  const isLongPressTriggered = useRef(false);
  const hasMoved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback((e: React.PointerEvent) => {
    if (filter && !filter(e)) return;
    isLongPressActive.current = false;
    isLongPressTriggered.current = false;
    hasMoved.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    
    // Clone event properties that might be needed in the timeout
    const target = e.target;
    const currentTarget = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // We create a mock event object because the React SyntheticEvent might be nullified (React < 17) or change
    const syntheticEvent = { target, currentTarget, clientX, clientY, preventDefault: e.preventDefault.bind(e), stopPropagation: e.stopPropagation.bind(e) } as unknown as React.PointerEvent;

    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (vibrate && 'vibrate' in navigator) navigator.vibrate(50);
      if (onLongPressReady) onLongPressReady();
      if (onLongPress) onLongPress(syntheticEvent);
    }, ms);
  }, [ms, onLongPressReady, vibrate, onLongPress]);

  const move = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
        hasMoved.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
        isLongPressActive.current = false;
    }
  }, []);

  const clear = useCallback((e: React.PointerEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    } else if (isLongPressTriggered.current && !hasMoved.current) {
       if (onLongPressEnd) onLongPressEnd(e);
    }
    isLongPressActive.current = false;
  }, [onLongPressEnd]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (filter && !filter(e)) return;
    if (isLongPressTriggered.current || hasMoved.current) {
      isLongPressTriggered.current = false;
      hasMoved.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onDoubleClick) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        onDoubleClick(e);
      } else {
        clickTimeoutRef.current = setTimeout(() => {
          if (onClick) onClick(e);
          clickTimeoutRef.current = null;
        }, 220); // 220ms is comfortable for double-click and feels relatively fast for single-click
      }
    } else {
      if (onClick) onClick(e);
    }
  }, [onClick, onDoubleClick]);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onClick: handleClick,
    onContextMenu: (e: React.MouseEvent) => {
      if (isLongPressTriggered.current || isLongPressActive.current) e.preventDefault();
    },
  };
}

