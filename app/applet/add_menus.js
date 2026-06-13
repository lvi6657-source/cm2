const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const funcs = `
  const handleExportJSON = () => {
    const data = { cards, windows };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
    setShowWindowDropdown(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.cards && Array.isArray(data.cards)) {
          setCards(data.cards);
        }
        if (data.windows && Array.isArray(data.windows)) {
          setWindows(data.windows);
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
    };
    reader.readAsText(file);
    setShowWindowDropdown(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleExportMarkdown = () => {
    let md = "";
    const buildMarkdownTree = (parentId: string | null, level: number) => {
      const children = cards.filter(c => c.parentId === parentId && !c.isDeleted && (parentId !== null || (c.windowId || "w1") === activeWindowId));
      children.forEach(c => {
        const indent = "  ".repeat(level);
        md += \`\${indent}- [\${c.completed ? "x" : " "}] \${c.text}\\n\`;
        buildMarkdownTree(c.id, level + 1);
      });
    };
    buildMarkdownTree(null, 0);

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`export_\${activeWindow?.name || "window"}.md\`;
    a.click();
    URL.revokeObjectURL(url);
    setShowWindowDropdown(false);
  };
`;

code = code.replace('const removeWindowTimeoutRef = useRef<NodeJS.Timeout | null>(null);', funcs + '\n\n  const removeWindowTimeoutRef = useRef<NodeJS.Timeout | null>(null);');

const jsxButtons = `                    ))}
                    <div className="h-px bg-zinc-800 my-1" />
                    <button onClick={handleExportJSON} className="w-full text-left px-4 py-2 font-medium text-zinc-400 hover:bg-zinc-800 text-sm">Скачать резервную копию (JSON)</button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 font-medium text-zinc-400 hover:bg-zinc-800 text-sm">Восстановить (JSON)</button>
                    <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJSON} />
                    <button onClick={handleExportMarkdown} className="w-full text-left px-4 py-2 font-medium text-zinc-400 hover:bg-zinc-800 text-sm">Экспортировать (Markdown)</button>
`;

code = code.replace('                    ))}'+'\n'+'                  </div>', jsxButtons + '                  </div>');

fs.writeFileSync('src/App.tsx', code);
console.log('done');
