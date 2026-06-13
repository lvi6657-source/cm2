const fs = require('fs');

const app = fs.readFileSync('src/App.tsx', 'utf8');

const sIdx = app.indexOf('<div className={`absolute bottom-0 w-full ${editingCardId ? "z-[250]" : "z-20"} pointer-events-none flex flex-col justify-end`}>');

const eIdx = app.indexOf('      </div>\\n    </div>\\n  );\\n}', sIdx);

const bbCode = app.substring(sIdx, eIdx + 12);
console.log("length of bbCode:", bbCode.length);

if (bbCode.length > 100) {
    let bbComponent = fs.readFileSync('src/components/BottomBar.tsx', 'utf8');
    const bStart = bbComponent.indexOf('return (\\n') + 9;
    const bEnd = bbComponent.lastIndexOf('\\n  );\\n};');
    bbComponent = bbComponent.substring(0, bStart) + bbCode + bbComponent.substring(bEnd);
    fs.writeFileSync('src/components/BottomBar.tsx', bbComponent);

    const usage = `<BottomBar
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
      />`;

    const newApp = app.substring(0, sIdx) + usage + app.substring(eIdx + 12);
    fs.writeFileSync('src/App.tsx', newApp);
    console.log("Done");
} else {
    console.log("Failed to find bbCode");
}
