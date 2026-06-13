const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<div\}\}\}*/g, '<div');
content = content.replace(/\{\.\.\.searchBtnLongPress\}\}\}\}\}*/g, '{...searchBtnLongPress}');
content = content.replace(/\}\}\}\}\}\}/g, ''); // just remove lingering closing braces
content = content.replace(/<button\}\}\}*/g, '<button');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed some syntax errors.');
