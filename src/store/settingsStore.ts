import { create } from "zustand";
import { persist } from "zustand/middleware";

export const FONTS = [
  "Inter",
  "Roboto Mono",
  "Fira Code",
  "Ubuntu Mono",
  "Jura",
  "Exo 2",
  "Rubik",
  "Montserrat",
  "Oswald",
  "Playfair Display",
  "Cormorant Garamond",
  "PT Serif",
  "Merriweather",
  "Caveat",
  "Comfortaa",
  "Amatic SC",
  "Neucha",
  "Marck Script",
  "Kelly Slab",
  "Russo One",
];

interface SettingsState {
  isListView: boolean;
  setIsListView: (val: boolean | ((prev: boolean) => boolean)) => void;
  textAlign: "center" | "left";
  setTextAlign: (val: "center" | "left" | ((prev: "center" | "left") => "center" | "left")) => void;
  fontSize: number;
  setFontSize: (val: number | ((prev: number) => number)) => void;
  lineHeight: number;
  setLineHeight: (val: number | ((prev: number) => number)) => void;
  fontIndex: number;
  setFontIndex: (val: number | ((prev: number) => number)) => void;
  textMode: "none" | "size" | "lineHeight" | "family";
  setTextMode: (val: "none" | "size" | "lineHeight" | "family") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isListView: false,
      setIsListView: (val) => set((state) => ({ isListView: typeof val === "function" ? val(state.isListView) : val })),
      textAlign: "center",
      setTextAlign: (val) => set((state) => ({ textAlign: typeof val === "function" ? val(state.textAlign) : val })),
      fontSize: 1.125,
      setFontSize: (val) => set((state) => ({ fontSize: typeof val === "function" ? val(state.fontSize) : val })),
      lineHeight: 1.25,
      setLineHeight: (val) => set((state) => ({ lineHeight: typeof val === "function" ? val(state.lineHeight) : val })),
      fontIndex: 0,
      setFontIndex: (val) => set((state) => ({ fontIndex: typeof val === "function" ? val(state.fontIndex) : val })),
      textMode: "none",
      setTextMode: (val) => set({ textMode: val }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        isListView: state.isListView,
        textAlign: state.textAlign,
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
        fontIndex: state.fontIndex,
      }), // textMode is not persisted
    }
  )
);
