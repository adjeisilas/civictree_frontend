#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('./node_modules/lucide-react/dist/lucide-react.d.ts', 'utf-8');

const hotfixes = [
  ['FacebookF', 'Facebook'],
  ['Twitter', 'Twitter'],
  ['MessageCircle', 'MessageCircle'],
  ['TreePine', 'TreePine'],
];

for (const [wanted, _alt] of hotfixes) {
  if (content.includes(`export { ${wanted} }`)) {
    console.log(`OK: ${wanted}`);
  } else {
    console.log(`MISSING: ${wanted}`);
    const matches = content.match(/export \{ ([^}]+) \}/);
    if (matches) {
      const items = matches[1].split(',').map(s => s.trim().split(' as ')[0].trim());
      const close = items.filter(n => n.toLowerCase() === wanted.toLowerCase() || n.includes(wanted));
      console.log('  candidates:', close);
    }
    const lowerMatches = content.match(new RegExp('export \\{ ([^}]+) \\}', 'g'));
    if (lowerMatches) {
      for (const m of lowerMatches) {
        if (m.toLowerCase().includes(wanted.toLowerCase())) {
          console.log('  match:', m);
        }
      }
    }
  }
}
