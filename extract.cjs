const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const match = content.indexOf('// Утилита для отдельной плитки (с поддержкой Dnd-kit)');
if (match !== -1) {
    const cardTileCode = content.slice(match);
    content = content.slice(0, match);
    
    // Add imports for CardTile
    const newImports = `import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLongPress } from "../hooks/useLongPress";
import { Card } from "../types";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
`;
    
    // Append default export
    const finalCardTileCode = newImports + '\n' + cardTileCode.replace('const CardTile: React.FC<{', 'export const CardTile: React.FC<{');
    
    fs.writeFileSync('src/components/CardTile.tsx', finalCardTileCode);
    
    // Also, add the import to App.tsx
    const appImports = 'import { CardTile } from "./components/CardTile";\n';
    
    // add it after `import { Card } from "./types";` if possible, otherwise at top
    // Since App.tsx has imports at top, we just put it after `import { useLongPress...`
    content = content.replace('import { useLongPress } from "./hooks/useLongPress";', 'import { useLongPress } from "./hooks/useLongPress";\nimport { CardTile } from "./components/CardTile";\nimport { Card } from "./types";');
    
    // Remove the `interface Card` from App.tsx since we are importing it from types
    content = content.replace(/export interface Card \{[\s\S]*?\n\}/, '');

    fs.writeFileSync('src/App.tsx', content);
    console.log('Extracted CardTile!');
}
