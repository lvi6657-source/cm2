import { create } from "zustand";

type VoiceMode = "single" | "multiple" | "continuous";

interface UIState {
  isTrashView: boolean;
  setIsTrashView: (val: boolean | ((prev: boolean) => boolean)) => void;
  isTreeView: boolean;
  setIsTreeView: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSearchActive: boolean;
  setIsSearchActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (val: string | ((prev: string) => string)) => void;
  isAddingNote: boolean;
  setIsAddingNote: (val: boolean | ((prev: boolean) => boolean)) => void;
  currentParentId: string | null;
  setCurrentParentId: (val: string | null | ((prev: string | null) => string | null)) => void;
  isSelectingCards: boolean;
  setIsSelectingCards: (val: boolean | ((prev: boolean) => boolean)) => void;
  selectionStep: number;
  setSelectionStep: (val: number | ((prev: number) => number)) => void;
  selectedCardIds: Set<string>;
  setSelectedCardIds: (val: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  
  isEditingWindow: boolean;
  setIsEditingWindow: (val: boolean | ((prev: boolean) => boolean)) => void;
  editWindowName: string;
  setEditWindowName: (val: string | ((prev: string) => string)) => void;
  showWindowDropdown: boolean;
  setShowWindowDropdown: (val: boolean | ((prev: boolean) => boolean)) => void;
  isRemoveWindowArmed: boolean;
  setIsRemoveWindowArmed: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  inputText: string;
  setInputText: (val: string | ((prev: string) => string)) => void;
  voiceMode: VoiceMode;
  setVoiceMode: (val: VoiceMode | ((prev: VoiceMode) => VoiceMode)) => void;
  showMicMenu: boolean;
  setShowMicMenu: (val: boolean | ((prev: boolean) => boolean)) => void;
  hoveredMicOption: VoiceMode | null;
  setHoveredMicOption: (val: VoiceMode | null | ((prev: VoiceMode | null) => VoiceMode | null)) => void;
  isListening: boolean;
  setIsListening: (val: boolean | ((prev: boolean) => boolean)) => void;
  voiceContext: "note" | "search";
  setVoiceContext: (val: "note" | "search" | ((prev: "note" | "search") => "note" | "search")) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (val: boolean | ((prev: boolean) => boolean)) => void;
  clipboardError: string | null;
  setClipboardError: (val: string | null | ((prev: string | null) => string | null)) => void;
  showTextModeMenu: boolean;
  setShowTextModeMenu: (val: boolean | ((prev: boolean) => boolean)) => void;
  hoveredTextMode: "size" | "lineHeight" | "family" | null;
  setHoveredTextMode: (val: "size" | "lineHeight" | "family" | null | ((prev: "size" | "lineHeight" | "family" | null) => "size" | "lineHeight" | "family" | null)) => void;
  showSelectMenu: boolean;
  setShowSelectMenu: (val: boolean | ((prev: boolean) => boolean)) => void;
  hoveredSelectMode: "all" | "active" | "completed" | null;
  setHoveredSelectMode: (val: "all" | "active" | "completed" | null | ((prev: "all" | "active" | "completed" | null) => "all" | "active" | "completed" | null)) => void;
  
  activeId: string | null;
  setActiveId: (val: string | null | ((prev: string | null) => string | null)) => void;
  editingCardId: string | null;
  setEditingCardId: (val: string | null | ((prev: string | null) => string | null)) => void;
  activeCardHistory: { canUndo: boolean; canRedo: boolean };
  setActiveCardHistory: (val: { canUndo: boolean; canRedo: boolean } | ((prev: { canUndo: boolean; canRedo: boolean }) => { canUndo: boolean; canRedo: boolean })) => void;
  overId: string | null;
  setOverId: (val: string | null | ((prev: string | null) => string | null)) => void;
  dragOffset: number;
  setDragOffset: (val: number | ((prev: number) => number)) => void;
  isDeletingMode: boolean;
  setIsDeletingMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTrashView: false,
  setIsTrashView: (val) => set((state) => ({ isTrashView: typeof val === "function" ? val(state.isTrashView) : val })),
  isTreeView: false,
  setIsTreeView: (val) => set((state) => ({ isTreeView: typeof val === "function" ? val(state.isTreeView) : val })),
  isSearchActive: false,
  setIsSearchActive: (val) => set((state) => ({ isSearchActive: typeof val === "function" ? val(state.isSearchActive) : val })),
  searchQuery: "",
  setSearchQuery: (val) => set((state) => ({ searchQuery: typeof val === "function" ? val(state.searchQuery) : val })),
  isAddingNote: false,
  setIsAddingNote: (val) => set((state) => ({ isAddingNote: typeof val === "function" ? val(state.isAddingNote) : val })),
  currentParentId: null,
  setCurrentParentId: (val) => set((state) => ({ currentParentId: typeof val === "function" ? val(state.currentParentId) : val })),
  isSelectingCards: false,
  setIsSelectingCards: (val) => set((state) => ({ isSelectingCards: typeof val === "function" ? val(state.isSelectingCards) : val })),
  selectionStep: 0,
  setSelectionStep: (val) => set((state) => ({ selectionStep: typeof val === "function" ? val(state.selectionStep) : val })),
  selectedCardIds: new Set<string>(),
  setSelectedCardIds: (val) => set((state) => ({ selectedCardIds: typeof val === "function" ? val(state.selectedCardIds) : val })),
  
  isEditingWindow: false,
  setIsEditingWindow: (val) => set((state) => ({ isEditingWindow: typeof val === "function" ? val(state.isEditingWindow) : val })),
  editWindowName: "",
  setEditWindowName: (val) => set((state) => ({ editWindowName: typeof val === "function" ? val(state.editWindowName) : val })),
  showWindowDropdown: false,
  setShowWindowDropdown: (val) => set((state) => ({ showWindowDropdown: typeof val === "function" ? val(state.showWindowDropdown) : val })),
  isRemoveWindowArmed: false,
  setIsRemoveWindowArmed: (val) => set((state) => ({ isRemoveWindowArmed: typeof val === "function" ? val(state.isRemoveWindowArmed) : val })),
  
  inputText: "",
  setInputText: (val) => set((state) => ({ inputText: typeof val === "function" ? val(state.inputText) : val })),
  voiceMode: "single",
  setVoiceMode: (val) => set((state) => ({ voiceMode: typeof val === "function" ? val(state.voiceMode) : val })),
  showMicMenu: false,
  setShowMicMenu: (val) => set((state) => ({ showMicMenu: typeof val === "function" ? val(state.showMicMenu) : val })),
  hoveredMicOption: null,
  setHoveredMicOption: (val) => set((state) => ({ hoveredMicOption: typeof val === "function" ? val(state.hoveredMicOption) : val })),
  isListening: false,
  setIsListening: (val) => set((state) => ({ isListening: typeof val === "function" ? val(state.isListening) : val })),
  voiceContext: "note",
  setVoiceContext: (val) => set((state) => ({ voiceContext: typeof val === "function" ? val(state.voiceContext) : val })),
  isSearchFocused: false,
  setIsSearchFocused: (val) => set((state) => ({ isSearchFocused: typeof val === "function" ? val(state.isSearchFocused) : val })),
  clipboardError: null,
  setClipboardError: (val) => set((state) => ({ clipboardError: typeof val === "function" ? val(state.clipboardError) : val })),
  showTextModeMenu: false,
  setShowTextModeMenu: (val) => set((state) => ({ showTextModeMenu: typeof val === "function" ? val(state.showTextModeMenu) : val })),
  hoveredTextMode: null,
  setHoveredTextMode: (val) => set((state) => ({ hoveredTextMode: typeof val === "function" ? val(state.hoveredTextMode) : val })),
  showSelectMenu: false,
  setShowSelectMenu: (val) => set((state) => ({ showSelectMenu: typeof val === "function" ? val(state.showSelectMenu) : val })),
  hoveredSelectMode: null,
  setHoveredSelectMode: (val) => set((state) => ({ hoveredSelectMode: typeof val === "function" ? val(state.hoveredSelectMode) : val })),
  
  activeId: null,
  setActiveId: (val) => set((state) => ({ activeId: typeof val === "function" ? val(state.activeId) : val })),
  editingCardId: null,
  setEditingCardId: (val) => set((state) => ({ editingCardId: typeof val === "function" ? val(state.editingCardId) : val })),
  activeCardHistory: { canUndo: false, canRedo: false },
  setActiveCardHistory: (val) => set((state) => ({ activeCardHistory: typeof val === "function" ? val(state.activeCardHistory) : val })),
  overId: null,
  setOverId: (val) => set((state) => ({ overId: typeof val === "function" ? val(state.overId) : val })),
  dragOffset: 0,
  setDragOffset: (val) => set((state) => ({ dragOffset: typeof val === "function" ? val(state.dragOffset) : val })),
  isDeletingMode: false,
  setIsDeletingMode: (val) => set((state) => ({ isDeletingMode: typeof val === "function" ? val(state.isDeletingMode) : val })),
}));

