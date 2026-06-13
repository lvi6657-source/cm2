const fs = require("fs");

let content = fs.readFileSync("src/App.tsx", "utf8");

const stateToRemove = [
  "isEditingWindow",
  "editWindowName",
  "showWindowDropdown",
  "isRemoveWindowArmed",
  "inputText",
  "voiceMode",
  "showMicMenu",
  "hoveredMicOption",
  "isListening",
  "voiceContext",
  "isSearchFocused",
  "clipboardError",
  "showTextModeMenu",
  "hoveredTextMode",
  "showSelectMenu",
  "hoveredSelectMode",
  "activeId",
  "editingCardId",
  "activeCardHistory",
  "overId",
  "dragOffset",
  "isDeletingMode",
];

for (const stateName of stateToRemove) {
  // e.g. const [activeId, setActiveId] = useState<string | null>(null);
  const regex = new RegExp(`^\\s*const\\s*\\[${stateName}\\s*,\\s*set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}\\]\\s*=\\s*useState.*?;`, "gm");
  content = content.replace(regex, "");
}

// Ensure useUIStore destructuring includes these lines.
// Find the existing useUIStore destructuring
const existingUseUIStoreMatch = content.match(/const\s*{\s*([^}]+)\s*}\s*=\s*useUIStore\(\);/);
if (existingUseUIStoreMatch) {
    const existing = existingUseUIStoreMatch[1];
    
    const newVars = [];
    for (const stateName of stateToRemove) {
        newVars.push(stateName);
        newVars.push(`set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`);
    }
    
    const replacement = `const {\n  ${existing},\n  ${newVars.join(", ")}\n} = useUIStore();`;
    content = content.replace(existingUseUIStoreMatch[0], replacement);
}

fs.writeFileSync("src/App.tsx", content);
console.log("Replaced useState with useUIStore");

