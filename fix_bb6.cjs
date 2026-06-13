const fs = require('fs');

const bb = fs.readFileSync('src/components/BottomBar.tsx', 'utf8');

// Find the start of the bottom bar
const sIdx = bb.indexOf('<div className={`absolute bottom-0 w-full ${editingCardId ? "z-[250]" : "z-20"} pointer-events-none flex flex-col justify-end`}>');

if (sIdx !== -1) {
    let chunk = bb.substring(sIdx);
    let lines = chunk.split(/\r?\n/);
    let openDivs = 0;
    let lastLineIdx = -1;

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        let countOpen = l.split('<div').length - 1;
        let countClose = l.split('</div').length - 1;
        openDivs += countOpen;
        openDivs -= countClose;

        if (openDivs === 0 && i > 0) {
            lastLineIdx = i;
            break;
        }
    }

    if(lastLineIdx !== -1) {
        const bbCode = lines.slice(0, lastLineIdx + 1).join('\n');
        console.log("length of final bbCode: " + bbCode.length);

        let finalComponent = fs.readFileSync('src/components/BottomBar.tsx', 'utf8');
        const bStart = finalComponent.indexOf('return (\\n') !== -1 ? finalComponent.indexOf('return (\\n') + 9 : finalComponent.indexOf('return (\n') + 9;
        
        finalComponent = finalComponent.substring(0, bStart) + bbCode + '\n  );\n};\n';
        fs.writeFileSync('src/components/BottomBar.tsx', finalComponent);
        console.log("We successfully rebuilt BottomBar.");
    } else {
        console.log("Failed to find end div");
    }
} else {
    console.log("Failed to find start string");
}
