// Transitive reachability gate: from dist/index.js, can we reach an import of a
// heavy/leaf peer? After Phase 2, qr/kakao/daum/sweetalert must be unreachable.
// xlsx-js-style/file-saver are still reachable until Phase 3 (expected).
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
function walk(f) {
  if (seen.has(f) || !fs.existsSync(f)) return;
  seen.add(f);
  const src = fs.readFileSync(f, 'utf8');
  const re = /(?:import|export)[^;\n]*?from\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1];
    if (peers.includes(spec)) hits.push(path.relative(root, f) + ' -> ' + spec);
    const r = resolve(f, spec);
    if (r) walk(r);
  }
  const re2 = /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g;
  while ((m = re2.exec(src))) {
    if (peers.includes(m[1])) hits.push(path.relative(root, f) + ' -> ' + m[1]);
  }
}
walk(path.join(root, 'index.js'));
console.log('modules scanned from main barrel:', seen.size);
const leaf = hits.filter((h) => !/xlsx-js-style|file-saver/.test(h));
const xlsx = hits.filter((h) => /xlsx-js-style|file-saver/.test(h));
if (leaf.length) {
  console.log('FAIL — leaf peer reachable from barrel:');
  leaf.forEach((h) => console.log('  ' + h));
  process.exit(1);
}
console.log('PASS — qr/kakao/daum/sweetalert unreachable from main barrel.');
console.log('xlsx/file-saver reachable (expected until Phase 3):', xlsx.length, 'edge(s)');
xlsx.slice(0, 8).forEach((h) => console.log('  ' + h));
