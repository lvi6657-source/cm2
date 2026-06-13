import { motion, AnimatePresence } from "motion/react";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  Mic,
  Plus,
  Check,
  ListPlus,
  TextQuote,
  Trash2,
  Search,
  ChevronLeft,
  Layers,
  Infinity,
  Minus,
  Copy,
  CheckSquare,
  Undo2,
  Redo2,
  Type,
  Baseline,
  AArrowUp,
  Square,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLongPress } from "./hooks/useLongPress";
import { useCardDnd } from "./hooks/useCardDnd";
import { useVoice } from "./hooks/useVoice";
import { useCardOperations } from "./hooks/useCardOperations";
import { CardTile } from "./components/CardTile";
import { Header } from "./components/Header";
import { BottomBar } from "./components/BottomBar";
import { Card } from "./types";
import { getRandomColor, darkenHsl, getDependentIds } from "./utils";

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";





type VoiceMode = "single" | "multiple" | "continuous";

import { useSettingsStore, FONTS } from "./store/settingsStore";
import { useAppStore } from "./store/appStore";
import { useUIStore } from "./store/uiStore";

export default function App() {
  const [viewportHeight, setViewportHeight] = useState("100dvh");
  const [viewportOffset, setViewportOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;
    
    const updateViewport = () => {
      setViewportHeight(`${window.visualViewport!.height}px`);
      setViewportOffset(window.visualViewport!.offsetTop);
      window.scrollTo(0, 0);
    };

    window.visualViewport.addEventListener("resize", updateViewport);
    window.visualViewport.addEventListener("scroll", updateViewport);
    updateViewport();

    return () => {
      window.visualViewport!.removeEventListener("resize", updateViewport);
      window.visualViewport!.removeEventListener("scroll", updateViewport);
    };
  }, []);

  const { cards, setCards, windows, setWindows, activeWindowId, setActiveWindowId } = useAppStore();
  const {
      isTrashView, setIsTrashView, 
      isTreeView, setIsTreeView, 
      isSearchActive, setIsSearchActive, 
      searchQuery, setSearchQuery, 
      isAddingNote, setIsAddingNote, 
      currentParentId, setCurrentParentId,
      isSelectingCards, setIsSelectingCards,
      selectionStep, setSelectionStep,
      selectedCardIds, setSelectedCardIds,
      isEditingWindow, setIsEditingWindow, editWindowName, setEditWindowName, showWindowDropdown, setShowWindowDropdown, isRemoveWindowArmed, setIsRemoveWindowArmed, inputText, setInputText, voiceMode, setVoiceMode, showMicMenu, setShowMicMenu, hoveredMicOption, setHoveredMicOption, isListening, setIsListening, voiceContext, setVoiceContext, isSearchFocused, setIsSearchFocused, clipboardError, setClipboardError, showTextModeMenu, setShowTextModeMenu, hoveredTextMode, setHoveredTextMode, showSelectMenu, setShowSelectMenu, hoveredSelectMode, setHoveredSelectMode, activeId, setActiveId, editingCardId, setEditingCardId, activeCardHistory, setActiveCardHistory, overId, setOverId, dragOffset, setDragOffset, isDeletingMode, setIsDeletingMode
  } = useUIStore();

  const activeTabRef = useRef<HTMLButtonElement>(null);
  const currentParentIdRef = useRef(currentParentId);
  const windowIdRef = useRef(activeWindowId);

  useEffect(() => {
    currentParentIdRef.current = currentParentId;
  }, [currentParentId]);

  useEffect(() => {
    windowIdRef.current = activeWindowId;
  }, [activeWindowId]);

  const { addCard, updateCard, deleteCard, toggleCardState } = useCardOperations(cards, setCards, currentParentIdRef, windowIdRef, setEditingCardId, currentParentId, setCurrentParentId, isTrashView);
  const { stopVoiceRecognition, startSpeechRecognition, speechBufferRef } = useVoice({ voiceMode, isListening, setIsListening, voiceContext, currentParentId, activeWindowId, addCard, setSearchQuery, setInputText, activeTabRef });
  const currentParent = useMemo(
    () => cards.find((c) => c.id === currentParentId),
    [cards, currentParentId],
  );


  const windowInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingWindow && windowInputRef.current) {
      windowInputRef.current.focus();
      windowInputRef.current.setSelectionRange(
        0,
        windowInputRef.current.value.length,
      );
    }
  }, [isEditingWindow]);

  const activeWindow =
    windows.find((w) => w.id === activeWindowId) || windows[0];

  const handleAddWindow = () => {
    let nextNum = 1;
    windows.forEach((w) => {
      if (w.name.startsWith("L")) {
        const num = parseInt(w.name.slice(1));
        if (!isNaN(num) && num >= nextNum) nextNum = num + 1;
      }
    });
    const newWindow = { id: "w_" + Date.now(), name: "L" + nextNum };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const handleExportJSON=()=>{const e={cards,windows},n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(n),o=document.createElement("a");o.href=t,o.download="backup_"+new Date().toISOString().split("T")[0]+".json",o.click(),URL.revokeObjectURL(t),setShowWindowDropdown(!1)};const fileInputRef=useRef(null);const handleImportJSON=e=>{const n=e.target.files?.[0];if(!n)return;const t=new FileReader;t.onload=e=>{try{const n=JSON.parse(e.target?.result as string);n.cards&&Array.isArray(n.cards)&&setCards(n.cards),n.windows&&Array.isArray(n.windows)&&setWindows(n.windows)}catch(e){console.error("Failed to parse JSON",e)}},t.readAsText(n),setShowWindowDropdown(!1),fileInputRef.current&&(fileInputRef.current.value="")};const handleExportMarkdown=()=>{let e="";const n=(id,level)=>{cards.filter((c=>c.parentId===id&&!c.isDeleted&&(null!==id||(c.windowId||"w1")===activeWindowId))).forEach((c=>{const indent="  ".repeat(level);e+=`${indent}- [${c.completed?"x":" "}] ${c.text}
`,n(c.id,level+1)}))};n(null,0);const t=new Blob([e],{type:"text/markdown"}),o=URL.createObjectURL(t),a=document.createElement("a");a.href=o,a.download=`export_${activeWindow?.name||"window"}.md`,a.click(),URL.revokeObjectURL(o),setShowWindowDropdown(!1)};

const removeWindowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRemoveWindowClick = () => {
    if (activeWindowId === "w1") return; // Cannot delete L1

    if (!isRemoveWindowArmed) {
      setIsRemoveWindowArmed(true);
      if (removeWindowTimeoutRef.current)
        clearTimeout(removeWindowTimeoutRef.current);
      removeWindowTimeoutRef.current = setTimeout(
        () => setIsRemoveWindowArmed(false),
        3000,
      );
    } else {
      // Delete all cards that belong to this window and their children
      setCards((prev) => {
        const rootIdsToRemove = prev
          .filter(
            (c) =>
              c.parentId === null && (c.windowId || "w1") === activeWindowId,
          )
          .map((c) => c.id);
        const allIdsToRemove = getDependentIds(rootIdsToRemove, prev);
        rootIdsToRemove.forEach((id) => allIdsToRemove.add(id));
        return prev.filter((c) => !allIdsToRemove.has(c.id));
      });

      const filtered = windows.filter((w) => w.id !== activeWindowId);
      setWindows(filtered);
      setActiveWindowId(filtered[0].id);
      setIsRemoveWindowArmed(false);
      if (removeWindowTimeoutRef.current)
        clearTimeout(removeWindowTimeoutRef.current);
    }
  };

  const cycleWindow = () => {
    const currentIndex = windows.findIndex((w) => w.id === activeWindowId);
    const nextIndex = (currentIndex + 1) % windows.length;
    setActiveWindowId(windows[nextIndex].id);
    setShowWindowDropdown(false);
  };

  const listViewToggleGestures = useLongPress({
    onClick: () => {
      clearInteractions("viewMode");
      setIsListView((prev) => !prev);
    },
    onLongPress: () => {
      clearInteractions("viewMode");
      if ("vibrate" in navigator) navigator.vibrate(50);
      setTextAlign((prev) => (prev === "center" ? "left" : "center"));
    },
    ms: 400,
  });

  const windowLongPress = useLongPress({
    onClick: () => {
      if (isEditingWindow) return;
      cycleWindow();
    },
    onDoubleClick: () => {
      if (isEditingWindow) return;
      setShowWindowDropdown((prev) => !prev);
    },
    onLongPress: () => {
      if ("vibrate" in navigator) navigator.vibrate(50);
      setEditWindowName(activeWindow.name);
      setIsEditingWindow(true);
      setShowWindowDropdown(false);
    },
    ms: 400,
  });

  const saveWindowName = () => {
    setIsEditingWindow(false);
    if (!editWindowName.trim()) return;
    setWindows(
      windows.map((w) =>
        w.id === activeWindowId ? { ...w, name: editWindowName.trim() } : w,
      ),
    );
  };


  const micTimerRef = useRef<NodeJS.Timeout | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAddingNote && !inputText.trim() && !isListening) {
      timeout = setTimeout(() => {
        setIsAddingNote(false);
      }, 7000);
    }
    return () => clearTimeout(timeout);
  }, [isAddingNote, inputText, isListening]);


  useEffect(() => {
    let searchTimeout: NodeJS.Timeout;
    if (isSearchActive && !searchQuery.trim() && !isSearchFocused && !isListening) {
      searchTimeout = setTimeout(() => {
        setIsSearchActive(false);
      }, 7000);
    }
    return () => clearTimeout(searchTimeout);
  }, [isSearchActive, searchQuery, isSearchFocused, isListening]);


  useEffect(() => {
    if (textAreaRef.current && isAddingNote) {
      textAreaRef.current.style.height = "55px";
      textAreaRef.current.style.height = Math.max(55, textAreaRef.current.scrollHeight) + "px";
      // Auto scroll to bottom
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [inputText, isAddingNote]);

  const {
    isListView, setIsListView,
    textAlign, setTextAlign,
    fontSize, setFontSize,
    lineHeight, setLineHeight,
    fontIndex, setFontIndex,
    textMode, setTextMode
  } = useSettingsStore();


  const fontTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const textModeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetFontTimeout = useCallback(() => {
    if (fontTimeoutRef.current) clearTimeout(fontTimeoutRef.current);
    fontTimeoutRef.current = setTimeout(() => {
      setTextMode("none");
    }, 7000);
  }, []);

  // Dragging & Editing state

  
  useEffect(() => {
    const handleHistoryState = (e: any) => {
      setActiveCardHistory(e.detail);
    };
    document.addEventListener("active-card-history-state", handleHistoryState);
    return () => document.removeEventListener("active-card-history-state", handleHistoryState);
  }, []);


    const handleEditStateChange = useCallback((id: string, isEditing: boolean) => {
    if (isEditing) {
      setEditingCardId(id);
    } else {
      setEditingCardId((prev) => (prev === id ? null : prev));
    }
  }, []);

  const getCardsInView = () => {
    let viewCards = cards;
    if (isTrashView) {
      viewCards = cards.filter((c) => c.isDeleted);
      if (isSearchActive && searchQuery.trim()) {
        viewCards = viewCards.filter((c) => c.text.toLowerCase().includes(searchQuery.toLowerCase()));
      }
    } else if (isSearchActive && searchQuery.trim()) {
      viewCards = cards.filter((c) => !c.isDeleted && c.text.toLowerCase().includes(searchQuery.toLowerCase()));
    } else if (currentParentId) {
      viewCards = cards.filter((c) => !c.isDeleted && c.parentId === currentParentId);
    } else {
      viewCards = cards.filter(
        (c) => !c.isDeleted && c.parentId === null && (c.windowId || "w1") === activeWindowId,
      );
    }
    return viewCards;
  };

  const searchBtnLongPress = useLongPress({
    onClick: () => {
      clearInteractions("search");
      setIsSearchActive(!isSearchActive);
    },
    onLongPress: () => {
      clearInteractions("search");
      if ("vibrate" in navigator) navigator.vibrate(50);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setVoiceContext("search");
      speechBufferRef.current = "";
      setSearchQuery("");
      setIsSearchActive(true);
      startSpeechRecognition();
    },
    ms: 500
  });

  const hasCardsToInsert =
    isSelectingCards &&
    selectedCardIds.size > 0 &&
    Array.from(selectedCardIds).some(
      (id) => {
        const c = cards.find((c) => c.id === id);
        // A card is considered "foreign" (to be inserted) if its parent is not the current view's parent,
        // AND it's also not the current view's parent itself.
        return c?.id !== currentParentId && c?.parentId !== currentParentId || c?.isDeleted;
      }
    );

  const hasCardsToPinToggle = isSelectingCards && selectedCardIds.size > 0 && !hasCardsToInsert;
  const areAllSelectedPinned = hasCardsToPinToggle && Array.from(selectedCardIds).every(id => cards.find(c => c.id === id)?.isPinned);

  const noteBtnLongPress = useLongPress({
    onLongPress: () => {
      setIsTreeView((prev) => !prev);
      if ("vibrate" in navigator) navigator.vibrate(50);
    },
    onClick: () => {
      if (hasCardsToInsert) {
        setCards((prev) => {
          const isAncestor = (ancestorId: string, targetId: string | null) => {
            let curr = targetId;
            const visited = new Set<string>();
            while (curr) {
              if (curr === ancestorId) return true;
              if (visited.has(curr)) break; // Detect existing cycles
              visited.add(curr);
              const parent = prev.find((c) => c.id === curr);
              curr = parent ? parent.parentId : null;
            }
            return false;
          };

          const validSelectedIds = new Set(
            Array.from(selectedCardIds).filter((id) => !isAncestor(id as string, currentParentId))
          );

          return prev.map((c) =>
            validSelectedIds.has(c.id)
              ? {
                  ...c,
                  isDeleted: false,
                  parentId: currentParentId,
                  windowId: currentParentId ? c.windowId : activeWindowId,
                }
              : c
          );
        });
        setIsSelectingCards(false);
        setSelectionStep(0);
        setSelectedCardIds(new Set());
        return;
      }
      if (hasCardsToPinToggle) {
        setCards((prev) => 
          prev.map((c) => selectedCardIds.has(c.id) ? { ...c, isPinned: !areAllSelectedPinned } : c)
        );
        setIsSelectingCards(false);
        setSelectionStep(0);
        setSelectedCardIds(new Set());
        return;
      }
      clearInteractions("addingNote");
      setIsAddingNote(!isAddingNote);
    },
    ms: 500
  });


  const handleManualAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (textMode !== "none") return;

    if (isListening) {
      stopVoiceRecognition();
    }

    if (inputText.trim()) {
      addCard(inputText);
    }
    setInputText("");
    speechBufferRef.current = "";
  };




  const toggleVoiceMode = () => {
    setVoiceMode((prev) =>
      prev === "single"
        ? "multiple"
        : prev === "multiple"
          ? "continuous"
          : "single",
    );
  };

  const handleMicPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only allow main button (left click) or touch
    if (e.button !== 0) return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    micTimerRef.current = setTimeout(() => {
      setShowMicMenu(true);
      if ("vibrate" in navigator) navigator.vibrate(50);
    }, 400);
  };

  const handleMicPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!showMicMenu) return;
    
    // Find what element is under pointer
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    let foundMode: VoiceMode | null = null;
    for (const el of els) {
      const mode = el.getAttribute('data-mic-mode') as VoiceMode | null;
      if (mode) {
        foundMode = mode;
        break;
      }
    }
    
    if (hoveredMicOption !== foundMode) {
      setHoveredMicOption(foundMode);
      if (foundMode && "vibrate" in navigator) navigator.vibrate(20);
    }
  };

  const handleMicPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (micTimerRef.current) {
      clearTimeout(micTimerRef.current);
      micTimerRef.current = null;
    }
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (showMicMenu) {
      if (hoveredMicOption) {
        setVoiceMode(hoveredMicOption);
      }
      setShowMicMenu(false);
      setHoveredMicOption(null);
    } else {
      // Short click
      handleMicClick();
    }
  };

  const handleTextModePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    clearInteractions("textMode");
    e.currentTarget.setPointerCapture(e.pointerId);
    textModeTimerRef.current = setTimeout(() => {
      setShowTextModeMenu(true);
      if ("vibrate" in navigator) navigator.vibrate(50);
    }, 400);
  };

  const handleTextModePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!showTextModeMenu) return;
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    let foundMode: "size" | "lineHeight" | "family" | null = null;
    for (const el of els) {
      const mode = el.getAttribute('data-text-mode') as "size" | "lineHeight" | "family" | null;
      if (mode) {
        foundMode = mode;
        break;
      }
    }
    if (hoveredTextMode !== foundMode) {
      setHoveredTextMode(foundMode);
      if (foundMode && "vibrate" in navigator) navigator.vibrate(20);
    }
  };

  const handleTextModePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (textModeTimerRef.current) {
      clearTimeout(textModeTimerRef.current);
      textModeTimerRef.current = null;
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (showTextModeMenu) {
      if (hoveredTextMode) {
        setTextMode(hoveredTextMode);
        resetFontTimeout();
      }
      setShowTextModeMenu(false);
      setHoveredTextMode(null);
    } else {
      // Short click behaviour from modeLongPress.onClick
      if (isDeletingMode) {
        setIsDeletingMode(false);
        clearDeletingTimeout();
        setSelectedCardIds(new Set());
        if ("vibrate" in navigator) navigator.vibrate(50);
        return;
      }
      if (isSelectingCards) {
        resetDeletingTimeout();
        setIsSelectingCards(false);
        setSelectionStep(0);
        setSelectedCardIds(new Set());
        if ("vibrate" in navigator) navigator.vibrate(50);
        return;
      }
      if (isAddingNote && inputText.length > 0) {
        setInputText("");
        if ("vibrate" in navigator) navigator.vibrate(50);
        return;
      }
      if (isSearchActive && searchQuery.length > 0) {
        setSearchQuery("");
        if ("vibrate" in navigator) navigator.vibrate(50);
        return;
      }

      if (textMode === "size") {
        setFontSize((f) => Math.max(0.6, +(f - 0.01).toFixed(3)));
        resetFontTimeout();
        return;
      } else if (textMode === "lineHeight") {
        setLineHeight((l) => Math.max(0.8, +(l - 0.05).toFixed(2)));
        resetFontTimeout();
        return;
      } else if (textMode === "family") {
        setFontIndex((i) => (i - 1 + FONTS.length) % FONTS.length);
        resetFontTimeout();
        return;
      }
      
      // If none, behave as Back button
      if (isTrashView) {
        setIsTrashView(false);
      } else if (currentParentId) {
        const p = cards.find((c) => c.id === currentParentId);
        setCurrentParentId(p?.parentId || null);
        if ("vibrate" in navigator) navigator.vibrate(50);
      }
    }
  };

  const handleSelectPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    clearInteractions("selecting");
    e.currentTarget.setPointerCapture(e.pointerId);
    selectTimerRef.current = setTimeout(() => {
      setShowSelectMenu(true);
      if ("vibrate" in navigator) navigator.vibrate(50);
    }, 400);
  };

  const handleSelectPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!showSelectMenu) return;
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    let foundMode: "all" | "active" | "completed" | null = null;
    for (const el of els) {
      const mode = el.getAttribute('data-select-mode') as "all" | "active" | "completed" | null;
      if (mode) {
        foundMode = mode;
        break;
      }
    }
    if (hoveredSelectMode !== foundMode) {
      setHoveredSelectMode(foundMode);
      if (foundMode && "vibrate" in navigator) navigator.vibrate(20);
    }
  };

  const handleSelectPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (selectTimerRef.current) {
      clearTimeout(selectTimerRef.current);
      selectTimerRef.current = null;
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (showSelectMenu) {
      if (hoveredSelectMode) {
        // Execute block select
        const viewCards = getCardsInView();
        let targets: string[] = [];
        if (hoveredSelectMode === "all") {
          targets = viewCards.map(c => c.id);
        } else if (hoveredSelectMode === "active") {
          targets = viewCards.filter(c => !c.completed).map(c => c.id);
        } else if (hoveredSelectMode === "completed") {
          targets = viewCards.filter(c => c.completed).map(c => c.id);
        }
        
        setIsSelectingCards(true);
        setSelectionStep(1); // 1 = waiting for next command like delete
        setSelectedCardIds(new Set(targets));
        resetDeletingTimeout();
        if ("vibrate" in navigator) navigator.vibrate(50);
      }
      setShowSelectMenu(false);
      setHoveredSelectMode(null);
    } else {
      // Short click behaviour
      if (isSelectingCards || selectionStep > 0) {
        setIsSelectingCards(false);
        setSelectionStep(0);
        setSelectedCardIds(new Set());
        if ("vibrate" in navigator) navigator.vibrate(50);
      } else {
        setIsSelectingCards(true);
        setSelectionStep(0); // Standard manual select mode without step
        if ("vibrate" in navigator) navigator.vibrate(50);
      }
    }
  };

  const deletingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let delTimeout: NodeJS.Timeout;
    if (isDeletingMode && selectedCardIds.size === 0) {
      delTimeout = setTimeout(() => {
        setIsDeletingMode(false);
      }, 7000);
    }
    return () => clearTimeout(delTimeout);
  }, [isDeletingMode, selectedCardIds.size]);

  const resetDeletingTimeout = useCallback(() => {
    // Replaced by useEffect
  }, []);

  const clearDeletingTimeout = useCallback(() => {
    // Replaced by useEffect
  }, []);

  const clearInteractions = useCallback((skip?: string) => {
    if (skip !== "textMode") {
      setTextMode("none");
      if (fontTimeoutRef.current) clearTimeout(fontTimeoutRef.current);
    }
    if (skip !== "addingNote") setIsAddingNote(false);
    if (skip !== "search") setIsSearchActive(false);
    if (skip !== "deleting") {
      setIsDeletingMode(false);
      clearDeletingTimeout();
    }
    if (skip !== "selecting") {
      setIsSelectingCards(false);
      setSelectionStep(0);
      setSelectedCardIds(new Set());
    }
  }, [clearDeletingTimeout, setIsAddingNote, setIsSearchActive, setIsDeletingMode, setIsSelectingCards, setSelectionStep, setSelectedCardIds]);

  const copyGestures = useLongPress({
    onClick: () => {
      const selectedText = Array.from(selectedCardIds)
        .map((id) => cards.find((x) => x.id === id))
        .filter((c) => !!c)
        .sort((a, b) => cards.indexOf(a) - cards.indexOf(b))
        .map((c) => c?.text || "")
        .filter(Boolean)
        .join("\r\n\r\n");
      if (selectedText) {
        navigator.clipboard.writeText(selectedText);
        if ("vibrate" in navigator) navigator.vibrate(50);
      }
      setIsSelectingCards(false);
      setSelectionStep(0);
      setSelectedCardIds(new Set());
    },
    onLongPress: () => {
      let result = "";
      const topLevelCards = Array.from(selectedCardIds)
        .map(id => cards.find(c => c.id === id))
        .filter(c => c !== undefined) as Card[];
        
      topLevelCards.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));

      const traverse = (card: Card, indentLevel: number) => {
        const indent = "    ".repeat(indentLevel);
        const prefix = indentLevel > 0 ? "- " : "";
        result += `${indent}${prefix}${card.text}\n\n`;
        const children = cards
          .filter(c => c.parentId === card.id && !c.isDeleted)
          .sort((a, b) => {
            if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
            
            return 0;
          });
        children.forEach(child => traverse(child, indentLevel + 1));
      }
      
      topLevelCards.forEach(c => traverse(c, 0));

      if (result.trim()) {
        navigator.clipboard.writeText(result.trim());
        if ("vibrate" in navigator) navigator.vibrate(100);
      }
      setIsSelectingCards(false);
      setSelectionStep(0);
      setSelectedCardIds(new Set());
    },
    ms: 500,
  });

  const trashGestures = useLongPress({
    onLongPress: () => {
      if ("vibrate" in navigator) navigator.vibrate(50);
      
      if (isTrashView) {
        if (!isDeletingMode) {
          setIsDeletingMode(true);
          const trashCards = getCardsInView(); 
          setSelectedCardIds(new Set(trashCards.map(c => c.id)));
        } else {
          if (selectedCardIds.size > 0) {
            setCards((prev) => {
              const idsToRemove = getDependentIds(Array.from(selectedCardIds), prev);
              return prev.filter(c => !idsToRemove.has(c.id));
            });
            setIsDeletingMode(false);
            setSelectedCardIds(new Set());
          }
        }
        return;
      }

      if (!isDeletingMode) {
        setIsTrashView((prev) => !prev);
        setCurrentParentId(null);
        return;
      }

      if (isDeletingMode) {
        if (selectedCardIds.size > 0) {
          setCards((prev) => {
            const idsToRemove = getDependentIds(
              Array.from(selectedCardIds),
              prev,
            );
            if (isTrashView) {
              return prev.filter((c) => !idsToRemove.has(c.id));
            }
            return prev.map((c) => idsToRemove.has(c.id) ? { ...c, isDeleted: true } : c);
          });
        } else {
          // No selection -> delete ALL cards in current view
          setCards((prev) => {
            const viewCards = getCardsInView();
            const idsToRemove = getDependentIds(
              viewCards.map((c) => c.id),
              prev,
            );
            if (isTrashView) {
              return prev.filter((c) => !idsToRemove.has(c.id));
            }
            return prev.map((c) => idsToRemove.has(c.id) ? { ...c, isDeleted: true } : c);
          });
        }
        setIsDeletingMode(false);
        clearDeletingTimeout();
        setSelectedCardIds(new Set());
      }
    },
    onClick: () => {
      if (isSelectingCards) {
        setIsSelectingCards(false);
        setSelectionStep(0);
        if (selectedCardIds.size > 0) {
          setIsDeletingMode(true);
        }
        return;
      }
      if (isDeletingMode) {
        if (selectedCardIds.size === 0) {
          // Short click with 0 selection -> delete completed
          setCards((prev) => {
            const viewCards = getCardsInView();
            const completedRoots = viewCards
              .filter((c) => c.completed)
              .map((c) => c.id);
            if (completedRoots.length === 0) return prev;
            const toRemove = getDependentIds(completedRoots, prev);
            if (isTrashView) {
              return prev.filter((c) => !toRemove.has(c.id));
            }
            return prev.map((c) => toRemove.has(c.id) ? { ...c, isDeleted: true } : c);
          });
        }
        setIsDeletingMode(false);
        clearDeletingTimeout();
        setSelectedCardIds(new Set());
      } else {
        clearInteractions("deleting");
        setIsDeletingMode(true);
        resetDeletingTimeout();
      }
    },
    ms: 500,
    vibrate: false,
  });

  const backgroundGestures = useLongPress({
    onLongPress: (e) => {
      if (e.target === e.currentTarget) {
        if (editingCardId) {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        } else {
          setCurrentParentId(null);
        }
      }
    },
    onClick: (e) => {
      if (e.target === e.currentTarget) {
        if (editingCardId) {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        } else if (currentParentId) {
          const p = cards.find((c) => c.id === currentParentId);
          setCurrentParentId(p?.parentId || null);
        }
      }
    },
    ms: 400,
    vibrate: false,
  });

  const undoGestures = useLongPress({
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent("undo-active-card"));
    },
    onLongPress: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if ("vibrate" in navigator) navigator.vibrate(50);
      document.dispatchEvent(new CustomEvent("undo-all-active-card"));
    },
    ms: 500,
    vibrate: false,
  });

  const redoGestures = useLongPress({
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent("redo-active-card"));
    },
    onLongPress: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if ("vibrate" in navigator) navigator.vibrate(50);
      document.dispatchEvent(new CustomEvent("redo-all-active-card"));
    },
    ms: 500,
    vibrate: false,
  });

  const activeTabLongPress = useLongPress({
    onLongPress: () => {},
    onClick: () => {
      if (currentParentId) updateCard(currentParentId, { colorClass: getRandomColor() });
    },
    ms: 400,
  });

  const handleMicClick = () => {
    clearInteractions("mic");
    setVoiceContext("note");

    if (isListening) {
      stopVoiceRecognition();
    } else {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      speechBufferRef.current = "";
      setInputText("");
      setIsAddingNote(true);
      setIsSearchActive(false);
      startSpeechRecognition();
    }
  };

  const micLongPress = useLongPress({
    onLongPress: () => {
      if ("vibrate" in navigator) navigator.vibrate(50);
      toggleVoiceMode();
    },
    onClick: handleMicClick,
    ms: 500,
  });

  const getDarkerColor = (hsl: string | undefined): string => {
    if (!hsl) return "#020617"; // slate-950
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return "#020617";
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    let l = parseInt(match[3]);
    l = Math.max(0, Math.floor(l / 3)); // 3 times darker
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const appBgColor = getDarkerColor(currentParent?.colorClass);

  const effectiveListView = isListView || isTrashView;

  const displayCards = useMemo(() => {
    let result: (Card & { depth: number })[] = [];

    if (isTrashView) {
      // Find all deleted cards
      const deletedCards = cards.filter(c => c.isDeleted);
      const deletedDict = new Map(deletedCards.map(c => [c.id, c]));
      
      // Roots are cards that are deleted, and either have no parent or their parent is NOT deleted
      const roots = deletedCards.filter(c => !c.parentId || !deletedDict.has(c.parentId)).sort((a, b) => {
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
        
        return 0;
      });

      const flattenTrash = (children: Card[], depth: number) => {
        for (const child of children) {
          result.push({ ...child, depth });
          const nested = deletedCards.filter(c => c.parentId === child.id).sort((a, b) => {
            if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
            
            return 0;
          });
          flattenTrash(nested, depth + 1);
        }
      };
      
      flattenTrash(roots, 0);

      if (isSearchActive && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        result = result.filter(c => c.text.toLowerCase().includes(query));
      }
      return result;
    }

    if (isTreeView && isListView) {
      // Build a tree flattened view
      
      if (isSearchActive && currentParentId && !searchQuery.trim()) {
        const parentCard = cards.find(c => c.id === currentParentId);
        if (parentCard) {
          result.push({ ...parentCard, depth: 0 });
        }
      }
      
      const flatten = (parentId: string | null, depth: number) => {
        const children = cards
          .filter((c) => {
            if (c.parentId !== parentId) return false;
            if (c.isDeleted) return false;
            if (isSearchActive && searchQuery.trim()) {
              return c.text.toLowerCase().includes(searchQuery.trim().toLowerCase());
            }
            if (parentId === null && (c.windowId || "w1") !== activeWindowId) return false;
            return true;
          })
          .sort((a, b) => {
            if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
            
            return 0;
          });

        for (const child of children) {
          result.push({ ...child, depth });
          flatten(child.id, depth + 1);
        }
      };

      flatten(currentParentId, currentParentId ? 1 : 0);
      return result;
    }

    // Normal view
    const filtered = cards
      .filter((c) => {
        if (c.isDeleted) return false;
        if (isSearchActive && searchQuery.trim()) {
           return c.text.toLowerCase().includes(searchQuery.trim().toLowerCase());
        }
        if (isSearchActive && !searchQuery.trim() && currentParentId) {
           return c.parentId === currentParentId || c.id === currentParentId;
        }
        if (currentParentId) return c.parentId === currentParentId;
        return c.parentId === null && (c.windowId || "w1") === activeWindowId;
      })
      .sort((a, b) => {
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
        
        return 0;
      });

    return filtered.map(c => ({ ...c, depth: currentParentId ? 1 : 0 }));
  }, [cards, currentParentId, activeWindowId, isSearchActive, searchQuery, isTrashView, isTreeView, isListView]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(event.active.id as string);
    setDragOffset(0);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setDragOffset(event.delta.x);
    setOverId((event.over?.id as string) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((prev) => {
        let subList = prev
          .filter((c) => {
            if (currentParentId) return c.parentId === currentParentId;
            return (
              c.parentId === null && (c.windowId || "w1") === activeWindowId
            );
          })
          .sort((a, b) => {
            
            if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
            return 0;
          });

        const oldIndex = subList.findIndex((item) => item.id === active.id);
        const newIndex = subList.findIndex((item) => item.id === over.id);
        subList = arrayMove(subList, oldIndex, newIndex);
        subList.sort((a, b) => {
          
          if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
          return 0;
        });

        return [
          ...prev.filter((c) => {
            if (currentParentId) return c.parentId !== currentParentId;
            return !(
              c.parentId === null && (c.windowId || "w1") === activeWindowId
            );
          }),
          ...subList,
        ];
      });
    }

    setActiveId(null);
    setOverId(null);
    setDragOffset(0);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setDragOffset(0);
  };

  const headerColor =
    currentParent && !currentParent.colorClass?.startsWith("bg-")
      ? currentParent.colorClass
      : undefined;
  const rootCardsOrSiblings = currentParentId
    ? cards
        .filter((c) => {
          if (c.isDeleted) return false;
          if (c.parentId !== currentParent?.parentId) return false;
          if (c.completed && c.id !== currentParentId) return false;
          if (c.parentId === null)
            return (c.windowId || "w1") === activeWindowId;
          return true;
        })
        .sort((a, b) => {
          if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
          
          return 0;
        })
    : [];

  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".dnd-draggable")) return; // ignore swipe if starting on drag handle
    
    // Dismiss keyboard if scrolling/touching outside any card or toolbar
    if (editingCardId && !(e.target as HTMLElement).closest(".card-element") && !(e.target as HTMLElement).closest("header") && !(e.target as HTMLElement).closest("footer") && !(e.target as HTMLElement).closest("button")) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
    
    let clientX, clientY;
    if ("touches" in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as any).clientX;
       clientY = (e as any).clientY;
    }
    swipeStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
    };
  };

  const handleSwipeEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!swipeStartRef.current) return;
    let clientX, clientY;
    if ("changedTouches" in e) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    const dx = clientX - swipeStartRef.current.x;
    const dy = clientY - swipeStartRef.current.y;
    const dt = Date.now() - swipeStartRef.current.time;
    swipeStartRef.current = null;

    if (dt < 500 && Math.abs(dx) > 60 && Math.abs(dy) < 60) {
      if (currentParentId) {
        const currentIndex = rootCardsOrSiblings.findIndex(
          (s) => s.id === currentParentId,
        );
        if (currentIndex !== -1) {
          if (dx < 0 && currentIndex < rootCardsOrSiblings.length - 1) {
            setCurrentParentId(rootCardsOrSiblings[currentIndex + 1].id);
          } else if (dx > 0 && currentIndex > 0) {
            setCurrentParentId(rootCardsOrSiblings[currentIndex - 1].id);
          }
        }
      } else if (windows.length > 1) {
        const currentIndex = windows.findIndex((w) => w.id === activeWindowId);
        if (currentIndex !== -1) {
          if (dx < 0) {
            // swipe left -> next window
            const nextIndex = (currentIndex + 1) % windows.length;
            setActiveWindowId(windows[nextIndex].id);
          } else if (dx > 0) {
            // swipe right -> prev window
            const prevIndex =
              (currentIndex - 1 + windows.length) % windows.length;
            setActiveWindowId(windows[prevIndex].id);
          }
        }
      }
    }
  };

  return (
    <div
      className="flex flex-col fixed inset-0 w-full font-sans text-slate-200 overflow-hidden relative selection:bg-slate-700 transition-colors duration-500"
      style={{ backgroundColor: appBgColor, height: viewportHeight, top: viewportOffset }}
    >
      <AnimatePresence>
        {clipboardError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
          >
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-sm text-center">
              {clipboardError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <header className={`z-50 shrink-0 flex flex-col w-full absolute top-0 left-0 right-0 transition-all duration-300 ${editingCardId ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"}`}>
        <div className="flex w-full items-stretch justify-between h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          {isSelectingCards ? (
            <button
              key="copy"
              {...copyGestures}
              className="w-[18%] shrink-0 flex items-center justify-center transition-colors select-none touch-manipulation text-blue-400 hover:bg-slate-800/50 hover:text-blue-300 border-r border-slate-800/80"
              aria-label="Копировать выделенное"
            >
              <Copy className="w-5 h-5" />
            </button>
          ) : (
            <button
              {...listViewToggleGestures}
              className={`w-[18%] shrink-0 flex flex-col items-center justify-center gap-[0.15rem] transition-colors select-none touch-manipulation border-r border-slate-800/80 ${isListView ? "text-teal-400 bg-teal-900/40" : "text-slate-400 hover:bg-slate-900"}`}
              aria-label="Переключить вид слошным текстом"
            >
              <div className="w-5 h-1.5 rounded-sm bg-current opacity-80" />
              <div className="w-5 h-1.5 rounded-sm bg-current opacity-80" />
              <div className="w-5 h-1.5 rounded-sm bg-current opacity-80" />
            </button>
          )}

          {isTrashView ? (
            <div className="flex-1 flex justify-center items-center text-slate-300 font-bold text-[1.35rem]">Корзина</div>
          ) : currentParentId ? (
            <div className="flex-1 flex gap-2 no-scrollbar items-center overflow-x-auto snap-x relative before:content-[''] before:min-w-[50vw] before:shrink-0 after:content-[''] after:min-w-[50vw] after:shrink-0 px-2">
              {cards
                .filter((c) => {
                  if (c.isDeleted) return false;
                  if (c.parentId !== currentParent?.parentId) return false;
                  if (c.completed && c.id !== currentParentId) return false;
                  if (c.parentId === null)
                    return (c.windowId || "w1") === activeWindowId;
                  return true;
                })
                .sort((a, b) => {
                  if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
                  
                  return 0;
                })
                .map((c) => {
                  const isActive = c.id === currentParentId;
                  const hasSubCards = cards.some(
                    (sub) => !sub.isDeleted && sub.parentId === c.id,
                  );
                  const hasActiveSubCards = cards.some(
                    (sub) => !sub.isDeleted && sub.parentId === c.id && !sub.completed,
                  );
                  return (
                    <button
                      key={c.id}
                      ref={isActive ? activeTabRef : null}
                      {...(isActive ? activeTabLongPress : { onClick: () => setCurrentParentId(c.id) })}
                      onContextMenu={(e) => e.preventDefault()}
                      className={`shrink-0 px-5 py-2.5 overflow-hidden flex items-center justify-center select-none touch-manipulation font-medium shadow-sm transition-all relative snap-center max-w-[200px] ${!hasSubCards ? "cut-corner-br" : ""} ${
                        isActive
                          ? "scale-105 z-10 opacity-100 drop-shadow-md"
                          : "opacity-60 hover:opacity-100 scale-95 hover:scale-100 brightness-75"
                      }`}
                      style={{
                        backgroundColor: c.colorClass,
                        color: c.completed ? "#71717a" : "#fff",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none"
                      }}
                    >
                      <span className="truncate text-[1.1rem] select-none pointer-events-none">{c.text}</span>
                      {hasSubCards && (
                        <div
                          className="absolute bottom-0 right-0 w-0 h-0 z-10 pointer-events-none transition-colors"
                          style={{
                            borderStyle: "solid",
                            borderWidth: "0 0 14px 14px",
                            borderColor:
                              `transparent transparent ${hasActiveSubCards ? "white" : "#52525b"} transparent`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
            </div>
          ) : (
            <div className="flex-1 flex items-center px-1 gap-1 relative z-50">
              <button
                onClick={handleRemoveWindowClick}
                disabled={activeWindowId === "w1"}
                className={`w-10 h-10 flex items-center justify-center rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all text-2xl font-medium ${isRemoveWindowArmed ? "bg-red-600 text-white scale-110 shadow-lg shadow-red-500/30" : "text-slate-400 hover:text-red-400 hover:bg-slate-800"}`}
              >
                &minus;
              </button>
              <div className="relative flex-1 flex justify-center">
                {isEditingWindow ? (
                  <input
                    ref={windowInputRef}
                    value={editWindowName}
                    onChange={(e) => setEditWindowName(e.target.value)}
                    onBlur={saveWindowName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveWindowName();
                    }}
                    className="bg-zinc-800 text-zinc-100 text-[1.35rem] font-bold tracking-tight text-center rounded-md outline-none px-2 w-[120px]"
                  />
                ) : (
                  <button
                    {...windowLongPress}
                    className="text-[1.35rem] font-bold text-slate-200 tracking-tight px-3 py-1 rounded-md hover:bg-slate-800 transition-colors select-none touch-manipulation"
                  >
                    {activeWindow?.name || "L1"}
                  </button>
                )}
                {showWindowDropdown && !isEditingWindow && (
                  <div className="absolute top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl shadow-black/50 py-1 min-w-[120px] z-50 overflow-hidden">
                    {windows.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setActiveWindowId(w.id);
                          setShowWindowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 font-medium ${w.id === activeWindowId ? "text-white bg-zinc-800/80" : "text-zinc-400 hover:bg-zinc-800"}`}
                      >
                        {w.name}
                      </button>
                    ))}<div className="h-px bg-zinc-800 my-1" /><button onClick={handleExportJSON} className="w-full text-left px-4 py-2 font-medium text-zinc-400 hover:bg-zinc-800 text-sm">Скачать резервную копию (JSON)</button><button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 font-medium text-zinc-400 hover:bg-zinc-800 text-sm">Восстановить (JSON)</button><input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJSON} /><button onClick={handleExportMarkdown} className="w-full text-left px-4 py-2 font-medium text-zinc-400 hover:bg-zinc-800 text-sm">Экспортировать (Markdown)</button></div>
                )}
              </div>
              <button
                onClick={handleAddWindow}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-400 hover:bg-slate-800 transition-colors text-2xl font-medium"
              >
                +
              </button>
            </div>
          )}
          <div className="w-[18%] shrink-0 flex items-stretch border-l border-slate-800/80">
            <button
              key="trash"
              {...trashGestures}
              className={`w-full h-full flex items-center justify-center transition-all select-none touch-manipulation ${
                isDeletingMode
                  ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  : isTrashView
                    ? "text-red-400 bg-red-900/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main
        id="main-scroll-container"
        {...backgroundGestures}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        onMouseDown={handleSwipeStart}
        onMouseUp={handleSwipeEnd}
        className={`flex-1 overflow-y-auto pt-[3.6rem] px-0.5 flex flex-col w-full h-full transition-[padding] duration-300 ${isSearchActive || isAddingNote ? "pb-[40vh]" : "pb-16"}`}
      >
        {currentParent && !isSearchActive && (
          <div className={`mb-1 shrink-0 relative z-20 shadow-sm transition-opacity duration-300 ${editingCardId && editingCardId !== currentParent.id ? "pointer-events-none opacity-50" : ""}`}>
            <CardTile
              card={currentParent}
              isDragging={false}
              hasChildren={cards.some((c) => c.parentId === currentParent.id && !c.isDeleted)}
              hasActiveChildren={cards.some((c) => c.parentId === currentParent.id && !c.completed && !c.isDeleted)}
              onToggle={() => toggleCardState(currentParent.id)}
              onEnter={() => {
                setCurrentParentId(currentParent.id);
                setIsSearchActive(false);
                setSearchQuery("");
              }}
              onEditStart={stopVoiceRecognition}
              onEditStateChange={handleEditStateChange}
              onSelect={(activateSelectionMode?: boolean) => {
                if (isDeletingMode) {
                  resetDeletingTimeout();
                }
                if (activateSelectionMode && !isSelectingCards) {
                  setIsSelectingCards(true);
                  setSelectionStep(0);
                  setIsDeletingMode(false);
                  clearDeletingTimeout();
                }
                setSelectedCardIds((prev) => {
                  const s = new Set(prev);
                  if (s.has(currentParent.id)) s.delete(currentParent.id);
                  else s.add(currentParent.id);
                  return s;
                });
              }}
              onUpdate={(updates) => updateCard(currentParent.id, updates)}
              onDelete={() => deleteCard(currentParent.id)}
              disabled={isTrashView}
              disableDrag={true}
              fontSize={fontSize}
              lineHeight={lineHeight}
              fontFamily={FONTS[fontIndex]}
              isSelected={selectedCardIds.has(currentParent.id)}
              selectionMode={
                isSelectingCards ? "move" : isDeletingMode ? "delete" : null
              }
              isListView={true}
              textAlign={textAlign}
              depth={0}
            />
          </div>
        )}

        <DndContext
          key={effectiveListView ? "dnd-list-layout" : "dnd-grid-layout"}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          autoScroll={{ threshold: { x: 0, y: 0.15 }, acceleration: 7, layoutShiftCompensation: false }}
        >
          <div
            key={effectiveListView ? "list-layout" : "grid-layout"}
            className={
              effectiveListView
                ? "flex flex-col w-full"
                : "flex flex-wrap gap-1.5 p-1 items-start content-start"
            }
          >
            <SortableContext
              items={displayCards.map((c) => c.id)}
              strategy={effectiveListView ? verticalListSortingStrategy : rectSortingStrategy}
            >
              {displayCards.map((card) => (
                <div key={card.id} className={`transition-opacity duration-300 ${editingCardId && editingCardId !== card.id ? "pointer-events-none opacity-50" : ""}`}>
                  <CardTile
                    card={card}
                    depth={card.depth}
                  isDragging={activeId === card.id}
                  hasChildren={cards.some((c) => c.parentId === card.id && !c.isDeleted)}
                  hasActiveChildren={cards.some((c) => c.parentId === card.id && !c.completed && !c.isDeleted)}
                  onToggle={() => toggleCardState(card.id)}
                  onEnter={() => {
                    setCurrentParentId(card.id);
                    setIsSearchActive(false);
                    setSearchQuery("");
                  }}
                  onEditStart={stopVoiceRecognition}
                  onEditStateChange={handleEditStateChange}
                  onSelect={(activateSelectionMode?: boolean) => {
                    if (isDeletingMode) {
                      resetDeletingTimeout();
                    }
                    if (activateSelectionMode && !isSelectingCards) {
                      setIsSelectingCards(true);
                      setSelectionStep(0);
                      setIsDeletingMode(false);
                      clearDeletingTimeout();
                    }
                    setSelectedCardIds((prev) => {
                      const s = new Set(prev);
                      if (s.has(card.id)) s.delete(card.id);
                      else s.add(card.id);
                      return s;
                    });
                  }}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  onDelete={() => deleteCard(card.id)}
                  disabled={isTrashView}
                  disableDrag={isTreeView}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  fontFamily={FONTS[fontIndex]}
                  isSelected={selectedCardIds.has(card.id)}
                  selectionMode={
                    isSelectingCards ? "move" : isDeletingMode ? "delete" : null
                  }
                  isListView={effectiveListView}
                  textAlign={textAlign}
                />
                </div>
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </main>

      <div className={`absolute bottom-0 w-full ${editingCardId ? "z-[250]" : "z-20"} pointer-events-none flex flex-col justify-end`}>
        <AnimatePresence>
          {isSearchActive && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={`w-full bg-slate-900 h-14 px-2 border-t border-slate-800/80 items-center shadow-lg transform-gpu ${editingCardId ? "hidden" : "flex pointer-events-auto"}`}
            >
              <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoFocus={!(voiceContext === "search" && isListening)}
                className="w-full h-full min-w-0 bg-transparent outline-none pl-3 pr-2 text-slate-200 text-lg"
              />
              <button className="h-full px-2 text-slate-400 hover:text-slate-200" onClick={() => { setIsSearchActive(false); setSearchQuery(""); }}>
                <Minus className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {isAddingNote && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={`w-full bg-slate-900 px-2 min-h-14 border-t border-slate-800/80 items-end shadow-lg transform-gpu ${editingCardId ? "hidden" : "flex pointer-events-auto"}`}
            >
              <textarea
                ref={textAreaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={stopVoiceRecognition}
                onPointerDown={stopVoiceRecognition}
                placeholder="Новая запись..."
                autoFocus={!(voiceContext === "note" && isListening)}
                className="w-full min-w-0 bg-transparent outline-none pl-2 pr-2 py-[15px] leading-tight text-slate-200 text-[1.15rem] resize-none overflow-y-auto"
                style={{
                  height: "55px",
                  maxHeight: "75vh"
                }}
                onInput={(e) => {
                  e.currentTarget.style.height = "55px";
                  e.currentTarget.style.height = Math.max(55, e.currentTarget.scrollHeight) + "px";
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                   handleManualAdd(e);
                   setIsAddingNote(false);
                }}
                className="shrink-0 p-1 mb-2.5 text-blue-500 hover:text-blue-400 active:scale-95 transition-all self-end"
              >
                <Plus className="w-7 h-7" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex items-stretch shrink-0 ${editingCardId ? "bg-transparent border-transparent pointer-events-none" : "bg-slate-950 border-t border-slate-800/80 pointer-events-auto"} h-[60px]`}>
          <div className="flex items-stretch w-full h-full">
            {editingCardId ? (
              <>
                <button
                  type="button"
                  key="check"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); document.dispatchEvent(new CustomEvent("save-active-card")); }}
                  className="w-[18%] shrink-0 flex items-center justify-center transition-all text-green-400 bg-green-900/20 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:bg-green-800/30 animate-pulse pointer-events-auto drop-shadow-md select-none touch-none border-t border-r border-slate-800/80 rounded-tr-xl"
                >
                  <Check className="w-8 h-8" />
                </button>
                <div className="flex-1 shrink-0 bg-transparent border-transparent" />
                <button
                  type="button"
                  key="undo"
                  onMouseDown={(e) => e.preventDefault()}
                  {...undoGestures}
                  className={`w-[18%] shrink-0 flex items-center justify-center transition-colors pointer-events-auto drop-shadow-md border-t border-l border-r border-slate-800/80 rounded-tl-xl select-none touch-none ${activeCardHistory.canUndo ? "text-slate-300 hover:text-white bg-slate-900/80" : "text-slate-600 bg-slate-950/50 pointer-events-none"}`}
                >
                  <Undo2 className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  key="redo"
                  onMouseDown={(e) => e.preventDefault()}
                  {...redoGestures}
                  className={`w-[18%] shrink-0 flex items-center justify-center transition-colors border-t border-slate-800/80 pointer-events-auto drop-shadow-md select-none touch-none ${activeCardHistory.canRedo ? "text-slate-300 hover:text-white bg-slate-900/80" : "text-slate-600 bg-slate-950/50 pointer-events-none"}`}
                >
                  <Redo2 className="w-7 h-7" />
                </button>
              </>
            ) : (
              <>
                <div className="relative w-[18%] shrink-0 flex items-stretch">
                  <AnimatePresence>
                    {showTextModeMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-[110%] w-full flex flex-col gap-2 z-50 pointer-events-auto"
                      >
                        <div
                          data-text-mode="family"
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredTextMode === 'family' ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Type className="w-[1.35rem] h-[1.35rem] mb-1" />
                           <span className="text-[0.6rem] font-medium leading-none">Шрифт</span>
                        </div>
                        <div
                          data-text-mode="lineHeight"
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredTextMode === 'lineHeight' ? 'bg-teal-900/60 text-teal-200 border-teal-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Baseline className="w-[1.35rem] h-[1.35rem] mb-1" />
                           <span className="text-[0.6rem] font-medium leading-none">Интервал</span>
                        </div>
                        <div
                          data-text-mode="size"
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredTextMode === 'size' ? 'bg-slate-800 text-slate-200 border-slate-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <AArrowUp className="w-[1.35rem] h-[1.35rem] mb-1" />
                           <span className="text-[0.6rem] font-medium leading-none">Размер</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    type="button"
                    onPointerDown={handleTextModePointerDown}
                    onPointerMove={handleTextModePointerMove}
                    onPointerUp={handleTextModePointerUp}
                    onPointerCancel={handleTextModePointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`w-full shrink-0 flex items-center justify-center transition-colors select-none touch-none ${
                        textMode === "size"
                        ? "text-slate-200 bg-slate-800"
                        : textMode === "lineHeight"
                          ? "text-teal-200 bg-teal-900/60"
                          : textMode === "family"
                            ? "text-indigo-200 bg-indigo-900/60"
                            : currentParentId || isTrashView || (isSearchActive && searchQuery.length > 0)
                              ? "text-slate-200"
                              : "text-slate-600"
                    } hover:text-slate-300`}
                    aria-label="Назад или Уменьшить текст"
                  >
                    {textMode !== "none" ? (
                      <Minus className="w-6 h-6" />
                    ) : (
                      <ChevronLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
                <div className="w-[18%] shrink-0 relative flex items-stretch border-l border-slate-800/80">
                  <AnimatePresence initial={false}>
                    {textMode === "none" ? (
                      <motion.button
                        key="search-btn"
                        type="button"
                        {...searchBtnLongPress}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute inset-0 flex items-center justify-center transition-colors ${isSearchActive ? 'text-teal-400 bg-teal-900/20' : 'text-slate-400 hover:bg-slate-900'}`}
                      >
                         <Search className="w-5 h-5" />
                         {isSearchActive && voiceContext === "search" && isListening && (
                           <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                         )}
                      </motion.button>
                    ) : (
                      <motion.button
                        key="plus-btn"
                        type="button"
                        onClick={() => {
                          if (textMode === "size") {
                            setFontSize((f) => Math.min(3, +(f + 0.01).toFixed(3)));
                            resetFontTimeout();
                          } else if (textMode === "lineHeight") {
                            setLineHeight((l) => Math.min(3, +(l + 0.05).toFixed(2)));
                            resetFontTimeout();
                          } else if (textMode === "family") {
                            setFontIndex((i) => (i + 1) % FONTS.length);
                            resetFontTimeout();
                          }
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute inset-0 flex items-center justify-center transition-colors ${
                          textMode === "size"
                            ? "text-slate-200 bg-slate-800 hover:text-white"
                            : textMode === "lineHeight"
                              ? "text-teal-200 bg-teal-900/60 hover:text-teal-100"
                              : "text-indigo-200 bg-indigo-900/60 hover:text-indigo-100"
                        }`}
                      >
                         <Plus className="w-6 h-6" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                
                <button
                   type="button"
                   {...noteBtnLongPress}
                   onContextMenu={(e) => e.preventDefault()}
                   disabled={isTrashView && !hasCardsToInsert}
                   className={`flex-1 shrink-0 flex items-center justify-center font-medium select-none touch-manipulation border-l border-r border-slate-800/80 transition-colors ${isAddingNote ? 'text-blue-400 bg-blue-900/20' : 'text-slate-300 hover:bg-slate-900 text-[1.05rem]'} ${(isTrashView && !hasCardsToInsert) ? 'opacity-30 pointer-events-none' : ''}`}
                   style={{ WebkitUserSelect: "none", userSelect: "none" }}
                >
                   {hasCardsToInsert ? (isTrashView ? "Восстановить" : "Вставить") : hasCardsToPinToggle ? (areAllSelectedPinned ? "Открепить" : "Закрепить") : "Заметка"}
                </button>

                <div className="relative w-[18%] shrink-0 flex items-stretch">
                  <AnimatePresence>
                    {showSelectMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-[110%] w-full flex flex-col gap-2 z-50 pointer-events-auto"
                      >
                        <div
                          data-select-mode="all"
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredSelectMode === 'all' ? 'bg-blue-900/60 text-blue-200 border-blue-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <CheckSquare className="w-[1.35rem] h-[1.35rem] mb-1" />
                           <span className="text-[0.6rem] font-medium leading-none">Все</span>
                        </div>
                        <div
                          data-select-mode="completed"
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredSelectMode === 'completed' ? 'bg-blue-900/60 text-blue-200 border-blue-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Check className="w-[1.35rem] h-[1.35rem] mb-1" />
                           <span className="text-[0.6rem] font-medium leading-none">Заверш.</span>
                        </div>
                        <div
                          data-select-mode="active"
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredSelectMode === 'active' ? 'bg-blue-900/60 text-blue-200 border-blue-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Square className="w-[1.35rem] h-[1.35rem] mb-1" />
                           <span className="text-[0.6rem] font-medium leading-none">Акт.</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onPointerDown={handleSelectPointerDown}
                    onPointerMove={handleSelectPointerMove}
                    onPointerUp={handleSelectPointerUp}
                    onPointerCancel={handleSelectPointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`w-full shrink-0 transition-all flex items-center justify-center select-none touch-none ${isSelectingCards ? "text-white bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-slate-400 hover:bg-slate-900"}`}
                  >
                    <CheckSquare className="w-[1.2rem] h-[1.2rem]" />
                  </button>
                </div>

                <div className="relative w-[18%] shrink-0 flex items-stretch">
                  <AnimatePresence>
                    {showMicMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-[110%] w-full flex flex-col gap-2 z-50 pointer-events-auto"
                      >
                        <div
                          data-mic-mode="continuous"
                          className={`w-full aspect-square flex items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredMicOption === 'continuous' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Infinity className="w-[1.35rem] h-[1.35rem]" />
                        </div>
                        <div
                          data-mic-mode="multiple"
                          className={`w-full aspect-square flex items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredMicOption === 'multiple' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Layers className="w-[1.35rem] h-[1.35rem]" />
                        </div>
                        <div
                          data-mic-mode="single"
                          className={`w-full aspect-square flex items-center justify-center rounded-2xl shadow-xl transition-colors border ${hoveredMicOption === 'single' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                        >
                           <Mic className="w-[1.35rem] h-[1.35rem]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onPointerDown={handleMicPointerDown}
                    onPointerMove={handleMicPointerMove}
                    onPointerUp={handleMicPointerUp}
                    onPointerCancel={handleMicPointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isTrashView}
                    className={`flex-1 shrink-0 flex items-center justify-center transition-all ${
                      isListening && voiceContext === "note"
                        ? "bg-rose-500/15 text-rose-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-l border-slate-800/80"
                    } select-none touch-none ${isTrashView ? 'opacity-30 pointer-events-none' : ''}`}
                    aria-label="Голосовой ввод"
                  >
                    {voiceMode === "continuous" ? (
                      <div className={`relative ${isListening ? "scale-110 animate-pulse" : ""}`}>
                        <Mic className="w-[1.35rem] h-[1.35rem]" />
                        <Infinity className="w-[14px] h-[14px] absolute -bottom-1 -right-1" />
                      </div>
                    ) : voiceMode === "multiple" ? (
                      <div className={`relative ${isListening ? "scale-110 animate-pulse" : ""}`}>
                        <Mic className="w-[1.35rem] h-[1.35rem]" />
                        <Layers className="w-3 h-3 absolute -bottom-1 -right-1" />
                      </div>
                    ) : (
                      <Mic className={`w-[1.35rem] h-[1.35rem] ${isListening ? "scale-110 animate-pulse" : ""}`} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

