const fs = require('fs');
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appTsx.split('\\n');
console.log("Original lines:", lines.length);

const newLines = lines.slice(0, 1920);
newLines.push('      </div>');
newLines.push('    </div>');
newLines.push('  );');
newLines.push('}');
console.log("New lines:", newLines.length);

fs.writeFileSync('src/App.tsx', newLines.join('\\n'));
console.log('App.tsx Fixed!');
