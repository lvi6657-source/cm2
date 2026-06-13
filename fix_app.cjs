const fs = require('fs');
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appTsx.split('\\n');

console.log("Line 1918:", lines[1918]);
console.log("Line 1919:", lines[1919]);
console.log("Line 1920:", lines[1920]);
console.log("Line 1921:", lines[1921]);

// It looks like line 1919 is the '      />' part.
// I will keep lines 0 to 1919.
const newLines = lines.slice(0, 1920);

// Add the closing tags for App.tsx
newLines.push('      </div>');
newLines.push('    </div>');
newLines.push('  );');
newLines.push('}');

fs.writeFileSync('src/App.tsx', newLines.join('\\n'));
console.log('Fixed App.tsx');
