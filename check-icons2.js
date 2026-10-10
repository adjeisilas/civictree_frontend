#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('./node_modules/lucide-react/dist/lucide-react.d.ts', 'utf-8');

const iconsToCheck = ['Facebook', 'Twitter', 'TreePine', 'MessageCircle', 'CheckCircle2', 'Smartphone'];

for (const icon of iconsToCheck) {
  const regex = new RegExp(`\\b${icon}\\b\\s*[;:,(]`, 'i');
  const found = regex.test(content);
  const exportMatch = content.match(new RegExp(`(export\\s*\\{[^}]*\\b${icon}\\b[^}]*\\}|export\\s*\\{[^}]*\\})`, 'i'));
  console.log(`${icon}: in file=${found}, in exports=${exportMatch ? 'yes' : 'no'}`);
}

// Show first 50 icon names
const names = content.match(/export \{\n?\s*([^}]+)\n?\s*\}/s);
if (names) {
  const items = names[1].split(',').map(s => s.trim().split(/\s+as\s+/i)[0].trim());
  console.log('\nSample icons (first 50):');
  console.log(items.slice(0, 50).join(', '));
}
