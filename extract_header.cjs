const fs = require("fs");

let content = fs.readFileSync("src/App.tsx", "utf8");

const headerStart = content.indexOf("<header");
const headerEnd = content.indexOf("</header>") + 9;

if (headerStart !== -1 && headerEnd !== -1) {
    const headerCode = content.substring(headerStart, headerEnd);
    
    // Create Header.tsx
    const headerComponentCode = `import React from "react";
import { Folder, MoreHorizontal, Settings, Archive, Download, Grid, Trash2, Copy, FileIcon, Search, List as ListIcon } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";

export const Header: React.FC<{
  listViewToggleGestures: any;
  handleExportMarkdown: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddWindow: () => void;
  copyGestures: any;
  trashGestures: any;
  windowInputRef: React.RefObject<HTMLInputElement>;
  handleWindowNameSubmit: (e: React.FormEvent) => void;
}> = ({
  listViewToggleGestures,
  handleExportMarkdown,
  fileInputRef,
  handleImportJSON,
  handleAddWindow,
  copyGestures,
  trashGestures,
  windowInputRef,
  handleWindowNameSubmit
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
    ${headerCode}
  );
};
`;
    
    fs.writeFileSync("src/components/Header.tsx", headerComponentCode);
    
    // Replace Header in App.tsx
    content = content.replace(headerCode, `<Header 
        listViewToggleGestures={listViewToggleGestures} 
        handleExportMarkdown={handleExportMarkdown} 
        fileInputRef={fileInputRef} 
        handleImportJSON={handleImportJSON} 
        handleAddWindow={handleAddWindow} 
        copyGestures={copyGestures} 
        trashGestures={trashGestures} 
        windowInputRef={windowInputRef} 
        handleWindowNameSubmit={handleWindowNameSubmit} 
      />`);
      
    // Import Header
    content = content.replace('import { CardTile } from "./components/CardTile";', 'import { CardTile } from "./components/CardTile";\nimport { Header } from "./components/Header";');
    
    fs.writeFileSync("src/App.tsx", content);
    console.log("Extracted Header");
} else {
    console.log("Header not found");
}


