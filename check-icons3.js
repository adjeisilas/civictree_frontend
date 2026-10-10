#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('./node_modules/lucide-react/dist/lucide-react.d.ts', 'utf-8');

const iconsToCheck = ['Facebook', 'Twitter', 'TreePine', 'MessageCircle', 'CheckCircle2', 'Smartphone'];

for (const icon of iconsToCheck) {
  const regex = new RegExp(`declare const ${icon}[\\s:;]`, 'i');
  const found = regex.test(content);
  const exportRegex = new RegExp(`export \\{${icon}[^}]*\\}`, 'i');
  const exportFound = exportRegex.test(content);
  console.log(`${icon}: declare const=${found}, in export block=${exportFound}`);
}

// Show export block at end of file
const lastLines = content.split('\n').slice(-30);
console.log('\nLast 30 lines of d.ts:');
console.log(lastLines.join('\n'));
