const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
content = content.replace(/import \{.*?motion.*?\} from "motion\/react";\n?/g, '');
content = content.replace(/import \{.*?motion.*?\} from "framer-motion";\n?/g, '');

// Remove AnimatePresence tags
content = content.replace(/<\/?AnimatePresence[^>]*>\n?/g, '');

// Replace motion.div with div
content = content.replace(/<motion\.div/g, '<div');
content = content.replace(/<\/motion\.div>/g, '</div>');

// Replace motion.button with button
content = content.replace(/<motion\.button/g, '<button');
content = content.replace(/<\/motion\.button>/g, '</button>');

let prev;
do {
    prev = content;
    // initial={(dir: number) => ({ x: dir * 50, opacity: 0 })}
    content = content.replace(/\s+(initial|animate|exit|transition|custom)=\{[^\}]*\}/g, '');
    content = content.replace(/\s+(initial|animate|exit|transition|custom)=\{\([\s\S]*?\)\s*=>\s*\(\{[\s\S]*?\}\)\}/g, '');
} while (prev !== content);

fs.writeFileSync('src/App.tsx', content);
