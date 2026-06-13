import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_str = """<div className={`absolute bottom-0 w-full ${editingCardId ? "z-[250]" : "z-20"} pointer-events-none flex flex-col justify-end`}>"""
start_idx = content.find(start_str)

end_idx = content.rfind("</div>\n    </div>\n  );\n}")

if start_idx != -1 and end_idx != -1:
    bb_code = content[start_idx:end_idx].strip()
    
    bb_component = f"""import React from "react";
import {{ Plus, Minus, Search, CheckSquare, Square, Mic, Infinity, Layers, Check, Undo2, Redo2, Type, Baseline, AArrowUp, ChevronLeft }} from "lucide-react";
import {{ useAppStore }} from "../store/appStore";
import {{ useUIStore }} from "../store/uiStore";
import {{ useSettingsStore, FONTS }} from "../store/settingsStore";

export const BottomBar: React.FC<{{
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
}}> = ({{
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
}}) => {{
  const {{ cards, setCards, windows, setWindows, activeWindowId, setActiveWindowId }} = useAppStore();
  const {{ isListView, setIsListView, textAlign, setTextAlign, fontSize, setFontSize, lineHeight, setLineHeight, fontIndex, setFontIndex, textMode, setTextMode }} = useSettingsStore();
  const {{ 
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
  }} = useUIStore();

  return (
    {bb_code}
  );
}};
"""

    with open("src/components/BottomBar.tsx", "w", encoding="utf-8") as f:
        f.write(bb_component)
        
    replacement = """<BottomBar
        handleManualAdd={handleManualAdd}
        stopVoiceRecognition={stopVoiceRecognition}
        textAreaRef={textAreaRef}
        handleTextModePointerDown={handleTextModePointerDown}
        handleTextModePointerMove={handleTextModePointerMove}
        handleTextModePointerUp={handleTextModePointerUp}
        searchBtnLongPress={searchBtnLongPress}
        resetFontTimeout={resetFontTimeout}
        noteBtnLongPress={noteBtnLongPress}
        hasCardsToInsert={hasCardsToInsert}
        hasCardsToPinToggle={hasCardsToPinToggle}
        areAllSelectedPinned={areAllSelectedPinned}
        handleSelectPointerDown={handleSelectPointerDown}
        handleSelectPointerMove={handleSelectPointerMove}
        handleSelectPointerUp={handleSelectPointerUp}
        handleMicPointerDown={handleMicPointerDown}
        handleMicPointerMove={handleMicPointerMove}
        handleMicPointerUp={handleMicPointerUp}
      />"""
      
    content = content[:start_idx] + replacement + "\n" + content[end_idx:]
    content = content.replace('import { Header } from "./components/Header";', 'import { Header } from "./components/Header";\\nimport { BottomBar } from "./components/BottomBar";')
    
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Extracted BottomBar")
else:
    print("Could not find bottom bar")

