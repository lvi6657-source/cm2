const fs = require('fs');

const bb = fs.readFileSync('src/components/BottomBar.tsx', 'utf8');
const startStr = '<div className={`absolute bottom-0 w-full ${editingCardId ? "z-[250]" : "z-20"} pointer-events-none flex flex-col justify-end`}>';
let sIdx = bb.indexOf(startStr);

// The bottom bar is ~300 lines. Let's find the closing tags of bottom bar.
// Bottom bar has:
//       <div className={`absolute bottom-0 w-full...
//           ... 
//       </div>
//     </div>
//   );
// }
// Wait, the bottom bar only has ONE wrapper:
//       <div className={`absolute bottom-0 w-full...
//         <div className={`flex items-stretch shrink-0...
//           <div className="flex items-stretch w-full h-full"> ... </div>
//         </div>
//       </div>
// So it ends with </div></div></div>

let htmlCode = "";
if (sIdx !== -1) {
    let sub = bb.substring(sIdx);
    let eIdx = sub.indexOf('      </div>\\n    </div>\\n  );\\n}');
    if (eIdx !== -1) {
        htmlCode = sub.substring(0, eIdx + 12); // up to `      </div>`
    } else {
        htmlCode = sub.substring(0, 5000); // just grab a chunk and we can trim it
    }
}

const componentStr = `import React from "react";
import { Plus, Minus, Search, CheckSquare, Square, Mic, Infinity, Layers, Check, Undo2, Redo2, Type, Baseline, AArrowUp, ChevronLeft } from "lucide-react";
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
` + htmlCode + `
  );
};
`;

fs.writeFileSync('src/components/BottomBar.tsx', componentStr);
console.log("Success extracting htmlCode of length: " + htmlCode.length);
