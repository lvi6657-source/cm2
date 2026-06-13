const fs = require('fs');

const appPath = './src/App.tsx';
let appText = fs.readFileSync(appPath, 'utf8');

// We want to extract getRandomColor and darkenHsl to src/utils.ts
const utilsCode = `
export const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 60) + 30;
  const l = Math.floor(Math.random() * 20) + 15;
  return \`hsl(\${h}, \${s}%, \${l}%)\`;
};

export const darkenHsl = (hslStr: string, percentage: number) => {
  if (!hslStr.startsWith("hsl")) return hslStr;
  const match = hslStr.match(/hsl\\((\\d+),\\s*(\\d+)%,\\s*(\\d+)%\\)/);
  if (!match) return hslStr;
  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = Math.max(0, parseInt(match[3]) - percentage);
  return \`hsl(\${h}, \${s}%, \${l}%)\`;
};
`;

fs.writeFileSync('./src/utils.ts', utilsCode);
console.log('utils.ts written');

// Remove them from App.tsx
// They look like:
/*
const getRandomColor = () => {
...
};

const darkenHsl = (hslStr: string, percentage: number) => {
...
};
*/

appText = appText.replace(/const getRandomColor = \(\) => \{[\s\S]*?\};\n/, '');
appText = appText.replace(/const darkenHsl = \(hslStr: string, percentage: number\) => \{[\s\S]*?\};\n/, '');

// Add import
appText = appText.replace(/import \{ Card \} from "\.\/types";/, 'import { Card } from "./types";\nimport { getRandomColor, darkenHsl } from "./utils";');

fs.writeFileSync(appPath, appText);
console.log('App.tsx updated');
