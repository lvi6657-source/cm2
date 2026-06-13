import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLongPress } from "../hooks/useLongPress";
import { Card } from "../types";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

// Утилита для отдельной плитки (с поддержкой Dnd-kit)
export const CardTile: React.FC<{
  card: Card;
  onToggle: () => void;
  onEnter: () => void;
  onSelect?: (activate?: boolean) => void;
  onUpdate: (u: Partial<Card>) => void;
  onDelete: () => void;
  isDragging: boolean;
  disabled: boolean;
  disableDrag?: boolean;
  hasChildren: boolean;
  hasActiveChildren?: boolean;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  isSelected?: boolean;
  selectionMode?: "move" | "delete" | "unselected" | null;
  isListView?: boolean;
  isTreeView?: boolean;
  textAlign?: "center" | "left";
  depth?: number;
  onEditStart?: () => void;
  onEditStateChange?: (id: string, isEditing: boolean) => void;
}> = ({
  card,
  onToggle,
  onEnter,
  onSelect,
  onUpdate,
  onDelete,
  isDragging,
  disabled,
  disableDrag,
  hasChildren,
  hasActiveChildren,
  fontSize,
  lineHeight,
  fontFamily,
  isSelected,
  selectionMode,
  isListView,
  isTreeView,
  textAlign = "center",
  depth = 0,
  onEditStart,
  onEditStateChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id, disabled: disabled || disableDrag || isEditing });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      cardRef.current = node;
    },
    [setNodeRef],
  );

  const applyTypographyAndWidth = useCallback(() => {
    // Width logic
    const cardEl = cardRef.current;
    if (cardEl) {
      const width = cardEl.getBoundingClientRect().width;
      const vw = window.innerWidth;
      if (width >= vw * 0.91) {
        cardEl.classList.add("is-full-width");
      } else {
        cardEl.classList.remove("is-full-width");
      }
    }

    // Typography logic
    const measureEl = measureRef.current;
    if (!measureEl || !spanRef.current) return;

    const style = window.getComputedStyle(measureEl);
    let lh = parseFloat(style.lineHeight);
    if (isNaN(lh) || lh === 0) {
      const basePx =
        parseFloat(
          window.getComputedStyle(document.documentElement).fontSize,
        ) || 16;
      lh = fontSize * basePx * 1.25;
    }

    const height = measureEl.offsetHeight;
    let lines = Math.floor(height / lh + 0.1);
    lines = Math.max(1, lines);

    const reductionPercent = (lines - 1) * 0.01;
    const finalScale = Math.max(0.5, 1 - reductionPercent);
    const adjustedFontSize = isListView ? fontSize : fontSize * finalScale;

    // Only update if changed to avoid unnecessary renders
    if (spanRef.current.style.fontSize !== `${adjustedFontSize}rem`) {
      spanRef.current.style.fontSize = `${adjustedFontSize}rem`;
    }
  }, [fontSize, isListView]);

  // Apply synchronously before first browser paint
  useLayoutEffect(() => {
    applyTypographyAndWidth();
  }, [applyTypographyAndWidth, card.text]); // re-run immediately if remote text changes

  useEffect(() => {
    const cardEl = cardRef.current;
    const measureEl = measureRef.current;
    if (!cardEl || !measureEl) return;

    let rafId: number;
    // Fallback resize observer for external dimensional changes
    // Wrap with requestAnimationFrame to prevent "ResizeObserver loop limit exceeded" errors.
    const obs = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        applyTypographyAndWidth();
      });
    });

    obs.observe(cardEl);
    obs.observe(measureEl);
    return () => {
      obs.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [applyTypographyAndWidth]);

  const updateSize = useCallback((text: string) => {
    const newMaxWidth = Math.max(
      120,
      18 * fontSize * Math.sqrt(text.length || 1),
    );

    if (hiddenContainerRef.current)
      hiddenContainerRef.current.style.maxWidth = isListView ? (depth > 0 ? `calc(100% - ${depth * 14}px)` : "100%") : `min(${newMaxWidth}px, 92vw)`;
    if (cardRef.current)
      cardRef.current.style.maxWidth = isListView ? (depth > 0 ? `calc(100% - ${depth * 14}px)` : "100%") : `min(${newMaxWidth}px, 92vw)`;

    if (measureRef.current) {
      measureRef.current.textContent = text + "\u200B";
    }
  }, [fontSize, isListView, depth]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.textContent || "";
    if (history.length > 0 && text !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(text);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    updateSize(text);
  };

  const undo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (historyIndex > 0 && spanRef.current) {
      const newIndex = historyIndex - 1;
      const prev = history[newIndex];
      setHistoryIndex(newIndex);
      spanRef.current.textContent = prev;
      spanRef.current.focus();
      updateSize(prev);
    }
  };

  const redo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (historyIndex < history.length - 1 && spanRef.current) {
      const newIndex = historyIndex + 1;
      const next = history[newIndex];
      setHistoryIndex(newIndex);
      spanRef.current.textContent = next;
      spanRef.current.focus();
      updateSize(next);
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.dispatchEvent(new CustomEvent("active-card-history-state", {
        detail: {
          canUndo: historyIndex > 0,
          canRedo: historyIndex < history.length - 1
        }
      }));
    }
  }, [historyIndex, history.length, isEditing]);

  const isOldTailwindBg = card.colorClass?.startsWith("bg-");
  const customBg =
    !isOldTailwindBg && !card.completed && !isSelected
      ? card.colorClass
      : undefined;

  // Умный расчет ширины: стараемся держать пропорцию Ширина > Высота (около 1.3 - 1.5).
  // Коэффициент 18 создает идеальный баланс ширины, чтобы карточки были прямоугольными
  // и не растягивались на весь экран сразу
  const idealMaxWidth = Math.max(
    120,
    18 * fontSize * Math.sqrt(card.text.length || 1),
  );

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isEditing ? 200 : isDragging ? 10 : 1,
    scale: isDragging ? 1.05 : 1,
    opacity: isDragging ? 0.8 : 1,
    backgroundColor: customBg,
    width: isListView ? (depth > 0 ? `calc(100% - ${depth * 14}px)` : "100%") : "auto",
    minWidth: isListView ? "auto" : "min-content",
    maxWidth: isListView ? (depth > 0 ? `calc(100% - ${depth * 14}px)` : "100%") : `min(${idealMaxWidth}px, 92vw)`,
    marginLeft: isListView && depth > 0 ? `${depth * 14}px` : undefined,
    pointerEvents: isEditing ? "auto" : undefined,
  };

  useEffect(() => {
    if (isEditing && cardRef.current) {
      const handleResize = () => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        
        let viewportHeight = window.innerHeight;
        if (window.visualViewport) {
          viewportHeight = window.visualViewport.height;
        }
        
        // Toolbar is ~60px.
        const bottomLimit = viewportHeight - 70;
        
        if (rect.bottom > bottomLimit || rect.top < 0) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };
      
      setTimeout(handleResize, 50);
      setTimeout(handleResize, 300);

      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleResize);
        return () => window.visualViewport?.removeEventListener("resize", handleResize);
      } else {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }
    }
  }, [isEditing]);

  const enterEditMode = () => {
    if (disabled || card.completed || isEditing) return;
    setIsEditing(true);
    onEditStateChange?.(card.id, true);
    setHistory([card.text]);
    setHistoryIndex(0);
    onEditStart?.();
    // setTimeout ensures the element is ready before we try to focus
    setTimeout(() => {
      if (spanRef.current) {
        const el = spanRef.current;
        el.focus();
        if (
          typeof window.getSelection !== "undefined" &&
          typeof document.createRange !== "undefined"
        ) {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false); // Move to end
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }, 50);
  };

  const cardLongPress = useLongPress({
    ms: 550,
    filter: (e) => !(e.target as Element).closest('.drag-handle'),
    onClick: () => {
      if (!isEditing && !isDragging && !disabled) onEnter();
    },
    onDoubleClick: () => {
      if (!isEditing && !isDragging && !disabled) enterEditMode(); // Double short click -> edit text
    },
    onLongPress: () => {
      if (!isEditing && !isDragging) {
        if ("vibrate" in navigator) navigator.vibrate(50);
        if (onSelect) onSelect(true);
      }
    },
    vibrate: false,
  });

  const handleSave = useCallback(() => {
    if (!spanRef.current) return;
    const finalVal = spanRef.current.textContent || "";
    if (!finalVal.trim()) {
      onDelete(); // Удаляем если стерли весь текст
      setIsEditing(false);
      onEditStateChange?.(card.id, false);
      return;
    }
    // Only update if it actually changed
    if (finalVal.trim() !== card.text) {
      onUpdate({ text: finalVal.trim() });
    }
    setIsEditing(false);
    onEditStateChange?.(card.id, false);
  }, [card.text, onDelete, onUpdate, card.id, onEditStateChange]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // В режиме редактирования клик снаружи не должен сохранять карточку, по просьбе пользователя
  }, []);

  const undoAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (historyIndex > 0 && spanRef.current) {
      const newIndex = 0;
      const prev = history[newIndex];
      setHistoryIndex(newIndex);
      spanRef.current.textContent = prev;
      spanRef.current.focus();
      updateSize(prev);
    }
  };

  const redoAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (historyIndex < history.length - 1 && spanRef.current) {
      const newIndex = history.length - 1;
      const next = history[newIndex];
      setHistoryIndex(newIndex);
      spanRef.current.textContent = next;
      spanRef.current.focus();
      updateSize(next);
    }
  };

  useEffect(() => {
    if (!isEditing) return;
    
    const onGlobalSave = () => handleSave();
    const onGlobalUndo = (e: Event) => undo(e as any);
    const onGlobalRedo = (e: Event) => redo(e as any);
    const onGlobalUndoAll = (e: Event) => undoAll(e as any);
    const onGlobalRedoAll = (e: Event) => redoAll(e as any);
    
    document.addEventListener("save-active-card", onGlobalSave);
    document.addEventListener("undo-active-card", onGlobalUndo);
    document.addEventListener("redo-active-card", onGlobalRedo);
    document.addEventListener("undo-all-active-card", onGlobalUndoAll);
    document.addEventListener("redo-all-active-card", onGlobalRedoAll);
    
    return () => {
      document.removeEventListener("save-active-card", onGlobalSave);
      document.removeEventListener("undo-active-card", onGlobalUndo);
      document.removeEventListener("redo-active-card", onGlobalRedo);
      document.removeEventListener("undo-all-active-card", onGlobalUndoAll);
      document.removeEventListener("redo-all-active-card", onGlobalRedoAll);
    };
  }, [isEditing, handleSave, undo, redo, undoAll, redoAll]);

  // Обычный показ карточки или инлайн редактирование
  return (
    <>
      <div
        ref={hiddenContainerRef}
        aria-hidden="true"
        className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none flex flex-col justify-center px-4 py-2.5 cut-corner-br border border-transparent"
        style={{
          width: isListView ? (depth > 0 ? `calc(100% - ${depth * 14}px)` : "100%") : "max-content",
          minWidth: isListView ? "auto" : "min-content",
          maxWidth: isListView ? (depth > 0 ? `calc(100% - ${depth * 14}px)` : "100%") : `min(${idealMaxWidth}px, 92vw)`,
        }}
      >
        <div
          className={`flex-1 flex max-w-full items-center ${textAlign === "center" ? "justify-center text-center" : "justify-start text-left"}`}
        >
          <span
            ref={measureRef}
            className="block whitespace-pre-wrap font-medium"
            style={{
              fontSize: `${fontSize}rem`,
              lineHeight: lineHeight,
              fontFamily: `'${fontFamily}', sans-serif`,
              overflowWrap: "break-word",
            }}
          >
            {card.text + "\u200B"}
          </span>
        </div>
      </div>

      <div
        ref={setRefs}
        style={style}
        data-editing={isEditing ? 'true' : undefined}
        {...(isEditing ? {} : cardLongPress)}
        className={`card-element
         group
         relative overflow-hidden ${isEditing ? "cursor-text z-20 shadow-md ring-1 ring-zinc-500/50" : "cursor-pointer hover:brightness-110"}
         ${isEditing ? "select-auto touch-auto" : "select-none touch-pan-y"} transition-colors transition-opacity duration-200
         flex flex-col justify-center h-fit
         ${isListView ? `w-full px-6 py-4 border-b border-zinc-950/20 ${!hasChildren ? "cut-corner-br" : ""}` : `w-fit px-4 py-2.5 border border-zinc-950/50 ${!hasChildren ? "cut-corner-br" : ""}`}
         ${
           isSelected && selectionMode === "move"
             ? "!bg-white !text-black !border-zinc-400 shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10"
             : isSelected && selectionMode === "delete"
               ? "!bg-red-600 !text-white !border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10"
               : card.completed && !isEditing
                 ? `bg-zinc-900 opacity-60 grayscale !border-zinc-500 ${selectionMode != null && !isSelected ? "brightness-50" : ""}`
                 : `${isOldTailwindBg ? card.colorClass : ""} ${selectionMode != null && !isSelected ? "opacity-60 brightness-75 grayscale-[0.5]" : ""}`
         }
       `}
      >
        {card.isPinned && (
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white rounded-full z-10 shadow-sm" />
        )}
        {(selectionMode || !disabled) && !isEditing && (
          <div
            {...(selectionMode ? {} : attributes)}
            {...(selectionMode ? {} : listeners)}
            className={`absolute left-0 top-0 bottom-0 w-[25%] z-20 drag-handle ${selectionMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing dnd-draggable"}`}
            style={{ touchAction: "none" }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (selectionMode) {
                if (onSelect) onSelect(false);
              } else {
                onToggle();
              }
            }}
          />
        )}
        {isTreeView && hasChildren && !isEditing && (
          <div 
            className="absolute right-0 top-0 bottom-0 px-3 z-30 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onUpdate({ isCollapsed: !card.isCollapsed });
            }}
          >
            {card.isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </div>
        )}
        <div
          className={`flex-1 flex max-w-full items-center ${textAlign === "center" ? "justify-center text-center" : "justify-start text-left"}`}
        >
          <span
            ref={spanRef}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onBlur={handleBlur}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // allow Enter to work normally inside content editable without exiting
                e.stopPropagation();
              }
            }}
            className={`block whitespace-pre-wrap ${isEditing ? "transition-all duration-300" : "transition-colors duration-200"} font-medium group-[.is-full-width]:!font-normal outline-none ${card.completed && !isEditing ? "text-zinc-300" : isSelected && selectionMode === "move" ? "!text-black" : "text-zinc-100"} ${isEditing ? "caret-white" : ""}`}
            style={{
              fontSize: `${fontSize}rem`,
              lineHeight: lineHeight,
              fontFamily: `'${fontFamily}', sans-serif`,
              overflowWrap: "break-word",
              minWidth: isEditing ? "2ch" : undefined,
            }}
          >
            {card.text}
          </span>
        </div>

        {hasChildren && !isEditing && (
          <div
            className="absolute bottom-0 right-0 w-0 h-0 z-10 pointer-events-none transition-colors"
            style={{
              borderStyle: "solid",
              borderWidth: "0 0 14px 14px",
              borderColor: `transparent transparent ${isSelected ? "#ef4444" : (!hasActiveChildren ? "#52525b" : "white")} transparent`,
            }}
          />
        )}

        {/* Галочка завершения */}
                  {card.completed && !isEditing && (
            <div
              className="absolute bottom-1 right-1 text-zinc-400 bg-zinc-900 rounded-full p-0.5 border border-zinc-700 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
              </div>
    </>
  );
};
