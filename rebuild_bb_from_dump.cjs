const fs = require('fs');

const dump = fs.readFileSync('full_app_dump.txt', 'utf8');

// The dump has lines prefixed with `line_number:` 
// So let's split by line and clean it.
const lines = dump.split(/\r?\n/).map(l => {
    // some lines look like: `2039:      <div className=...`
    const match = l.match(/^\\d+:(.*)$/);
    if (match) {
        return match[1];
    }
    return l;
});

const content = lines.join('\n');
const sIdx = content.indexOf('<div className={`absolute bottom-0 w-full ${editingCardId ? "z-[250]" : "z-20"} pointer-events-none flex flex-col justify-end`}>');

if (sIdx !== -1) {
    let chunk = content.substring(sIdx);
    let lns = chunk.split('\\n');
    let openDivs = 0;
    let lastLineIdx = -1;

    for (let i = 0; i < lns.length; i++) {
        const l = lns[i];
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
        const bbCode = lns.slice(0, lastLineIdx + 1).join('\n');
        console.log("length of final bbCode: " + bbCode.length);

        let finalComponent = fs.readFileSync('src/components/BottomBar.tsx', 'utf8');
        const bStart = finalComponent.indexOf('return (\\n') !== -1 ? finalComponent.indexOf('return (\\n') + 9 : finalComponent.indexOf('return (\n') + 9;
        
        finalComponent = finalComponent.substring(0, bStart) + bbCode + '\n  );\n};\n';
        fs.writeFileSync('src/components/BottomBar.tsx', finalComponent);
        console.log("We successfully rebuilt BottomBar from dump!");
    } else {
        console.log("Failed to find end div");
    }
} else {
    console.log("Failed to find start string in dump");
}
