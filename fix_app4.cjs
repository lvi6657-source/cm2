const fs = require('fs');
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Use proper newline character
const lines = appTsx.split(/\r?\n/);

console.log("Original lines:", lines.length);

// We need to keep only up to the `</main>` and insert `<BottomBar />` and closing tags.
// Let's find '</main>'
const mainEndIdx = lines.findIndex(l => l.includes('</main>'));

if (mainEndIdx !== -1) {
    const newLines = lines.slice(0, mainEndIdx + 1);
    
    // insert the bottom bar
    newLines.push(`      <BottomBar
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
      />`);
      
    // find the last 3 closing tags from the ORIGINAL end of the file.
    // They are `</div>`, `</div>`, `);`, `}`
    newLines.push('      </div>');
    newLines.push('    </div>');
    newLines.push('  );');
    newLines.push('}');
    
    fs.writeFileSync('src/App.tsx', newLines.join('\n'));
    console.log("Successfully rebuilt App.tsx. New length:", newLines.length);
} else {
    console.log("Could not find </main>");
}
