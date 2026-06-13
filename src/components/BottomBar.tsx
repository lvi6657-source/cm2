import React from "react";
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
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); document.dispatchEvent(new CustomEvent("save-active-card")); }}
                  className="w-[18%] shrink-0 flex items-center justify-center transition-all text-green-400 bg-green-900/20 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:bg-green-800/30 animate-pulse pointer-events-auto drop-shadow-md select-none touch-none border-t border-r border-slate-800/80 rounded-tr-xl"
                >
                  <Check className="w-8 h-8" />
                </button>
                <div className="flex-1 shrink-0 bg-transparent border-transparent" />
                <button
                  type="button"
                  key="undo"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); document.dispatchEvent(new CustomEvent("undo-active-card")); }}
                  className={`w-[18%] shrink-0 flex items-center justify-center transition-colors pointer-events-auto drop-shadow-md border-t border-l border-r border-slate-800/80 rounded-tl-xl select-none touch-none ${activeCardHistory.canUndo ? "text-slate-300 hover:text-white bg-slate-900/80" : "text-slate-600 bg-slate-950/50 pointer-events-none"}`}
                >
                  <Undo2 className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  key="redo"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); document.dispatchEvent(new CustomEvent("redo-active-card")); }}
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
  );
};
