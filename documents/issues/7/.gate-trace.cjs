// Transitive reachability gate: starting from dist/index.js (the published main
// barrel), can the module graph reach an import of ANY optional/heavy peer?
// Follows both static `... from '...'` edges AND dynamic `import('...')` edges
// (a consumer bundler must resolve dynamic imports at build time too).
// After Phase 3 ALL of these peers must be UNREACHABLE from the main barrel.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..', '..', 'dist');
const peers = [
  'qrcode.react',
  'react-kakao-maps-sdk',
  'react-daum-postcode',
  'sweetalert2',
  'sweetalert2-react-content',
  'xlsx-js-style',
  'file-saver',
];
const seen = new Set();
const hits = [];
function resolve(from, spec) {
  if (!spec.startsWith('.')) return null;
  const p = path.join(path.dirname(from), spec);
  for (const cand of [p + '.js', path.join(p, 'index.js')]) {
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}
function edges(src) {
  const specs = [];
  let m;
  const reStatic = /(?:import|export)[^;\n]*?from\s*['"]([^'"]+)['"]/g;
  while ((m = reStatic.exec(src))) specs.push(m[1]);
  const reBare = /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g;
  while ((m = reBare.exec(src))) specs.push(m[1]);
  const reDyn = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = reDyn.exec(src))) specs.push(m[1]);
  return specs;
}
function walk(f, via) {
  if (seen.has(f) || !fs.existsSync(f)) return;
  seen.add(f);
  const src = fs.readFileSync(f, 'utf8');
  for (const spec of edges(src)) {
    if (peers.includes(spec)) hits.push(path.relative(root, f) + ' -> ' + spec + via);
    const r = resolve(f, spec);
    if (r) walk(r, '');
  }
}
walk(path.join(root, 'index.js'), '');
console.log('modules scanned from main barrel:', seen.size);
if (hits.length) {
  console.log('FAIL — peer reachable from main barrel:');
  [...new Set(hits)].forEach((h) => console.log('  ' + h));
  process.exit(1);
}
console.log('PASS — no optional/heavy peer (qr/kakao/daum/sweetalert/xlsx/file-saver) reachable from main barrel.');
