import React from "react";
import { Folder, MoreHorizontal, Settings, Archive, Download, Grid, Trash2, Copy, FileIcon, Search, List as ListIcon } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";
import { Card } from "../types";

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
  currentParent: Card | undefined;
  activeTabRef: React.RefObject<HTMLButtonElement>;
  activeTabLongPress: any;
  handleRemoveWindowClick: () => void;
  saveWindowName: () => void;
  windowLongPress: any;
  activeWindow: { id: string; name: string } | undefined;
  handleExportJSON: () => void;
}> = ({
  listViewToggleGestures,
  handleExportMarkdown,
  fileInputRef,
  handleImportJSON,
  handleAddWindow,
  copyGestures,
  trashGestures,
  windowInputRef,
  handleWindowNameSubmit,
  currentParent,
  activeTabRef,
  activeTabLongPress,
  handleRemoveWindowClick,
  saveWindowName,
  windowLongPress,
  activeWindow,
  handleExportJSON
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
    <header className={`z-50 shrink-0 flex flex-col w-full absolute top-0 left-0 right-0 transition-all duration-300 ${editingCardId ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"}`}>
        <div className="flex w-full items-stretch justify-between h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          <button
            {...listViewToggleGestures}
            className={`w-[18%] shrink-0 flex flex-col items-center justify-center gap-[0.15rem] transition-colors select-none touch-manipulation border-r border-slate-800/80 ${isListView ? "text-teal-400 bg-teal-900/40" : "text-slate-400 hover:bg-slate-900"}`}
            aria-label="Переключить вид слошным текстом"
          >
            <div className="w-5 h-1.5 rounded-sm bg-current opacity-80" />
            <div className="w-5 h-1.5 rounded-sm bg-current opacity-80" />
            <div className="w-5 h-1.5 rounded-sm bg-current opacity-80" />
          </button>

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
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  return a.order - b.order;
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
                              `transparent transparent ${hasActiveSubCards ? "white" : "#a1a1aa"} transparent`,
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
                    ))}
                    <div className="border-t border-zinc-800 my-1" />
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                      Скачать резервную копию (JSON)
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                      Восстановить (JSON)
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                      Экспортировать (Markdown)
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />
                  </div>
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
            {isSelectingCards ? (
              <button
                key="copy"
                {...copyGestures}
                className="w-full h-full flex items-center justify-center transition-colors select-none touch-manipulation text-blue-400 hover:bg-slate-800/50 hover:text-blue-300"
              >
                <Copy className="w-5 h-5" />
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </header>
  );
};
