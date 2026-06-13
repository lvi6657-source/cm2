const fs = require('fs');
const dump = fs.readFileSync('full_app_dump.txt', 'utf8');
const lines = dump.split(/\r?\n/).map(l => { const m = l.match(/^\d+:(.*)$/); return m ? m[1] : l; });

const start = 2038;
const end = 2375;

let bbCode = lines.slice(start, end + 1).join('\n');

let finalComponent = `import React from "react";
import { Plus, Minus, Search, CheckSquare, Square, Mic, Infinity, Layers, Check, Undo2, Redo2, Type, Baseline, AArrowUp, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store/appStore";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore, FONTS } from "../store/settingsStore";

export const BottomBar: React.FC<{
  handleManualAdd: (e: any) => void;
  stopVoiceRecognition: () => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  handleTextModePointerDown: (e: any) => void;
  handleTextModePointerMove: (e: any) => void;
  handleTextModePointerUp: (e: any) => void;
  searchBtnLongPress: any;
  resetFontTimeout: () => void;
  noteBtnLongPress: any;
  hasCardsToInsert: boolean;
  hasCardsToPinToggle: boolean;
  areAllSelectedPinned: boolean;
  handleSelectPointerDown: (e: any) => void;
  handleSelectPointerMove: (e: any) => void;
  handleSelectPointerUp: (e: any) => void;
  handleMicPointerDown: (e: any) => void;
  handleMicPointerMove: (e: any) => void;
  handleMicPointerUp: (e: any) => void;
}> = ({
  handleManualAdd,
  stopVoiceRecognition,
  textAreaRef,
  handleTextModePointerDown,
  handleTextModePointerMove,
  handleTextModePointerUp,
  searchBtnLongPress,
  resetFontTimeout,
  noteBtnLongPress,
  hasCardsToInsert,
  hasCardsToPinToggle,
  areAllSelectedPinned,
  handleSelectPointerDown,
  handleSelectPointerMove,
  handleSelectPointerUp,
  handleMicPointerDown,
  handleMicPointerMove,
  handleMicPointerUp
}) => {
  const { cards, setCards, windows, setWindows, activeWindowId, setActiveWindowId } = useAppStore();
  const { isListView, setIsListView, textAlign, setTextAlign, fontSize, setFontSize, lineHeight, setLineHeight, fontIndex, setFontIndex, textMode, setTextMode } = useSettingsStore();
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
    isEditingWindow, setIsEditingWindow,
    editWindowName, setEditWindowName,
    showWindowDropdown, setShowWindowDropdown,
    isRemoveWindowArmed, setIsRemoveWindowArmed,
    inputText, setInputText,
    voiceMode, setVoiceMode,
    showMicMenu, setShowMicMenu,
    hoveredMicOption, setHoveredMicOption,
    isListening, setIsListening,
    voiceContext, setVoiceContext,
    isSearchFocused, setIsSearchFocused,
    clipboardError, setClipboardError,
    showTextModeMenu, setShowTextModeMenu,
    hoveredTextMode, setHoveredTextMode,
    showSelectMenu, setShowSelectMenu,
    hoveredSelectMode, setHoveredSelectMode,
    activeId, setActiveId,
    editingCardId, setEditingCardId,
    activeCardHistory, setActiveCardHistory,
    overId, setOverId,
    dragOffset, setDragOffset,
    isDeletingMode, setIsDeletingMode
  } = useUIStore();

  return (
` + bbCode + `
  );
};
`;

fs.writeFileSync('src/components/BottomBar.tsx', finalComponent);
console.log("Written BottomBar.tsx");
