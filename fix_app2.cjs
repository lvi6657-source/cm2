const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appTsx.split('\\n');

// 1920 lines means index 0 to 1919. So we keep exactly 1920 lines.
const newLines = lines.slice(0, 1920);

// Close the tags
newLines.push('      </div>');
newLines.push('    </div>');
newLines.push('  );');
newLines.push('}');

fs.writeFileSync('src/App.tsx', newLines.join('\\n'));
console.log('App.tsx Fixed!');
