import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const write = (p, v) => fs.writeFileSync(p, v, 'utf8');

// 1) Browser storage + IndexedDB + cloud hard stop.
let app = read('js/app.js');
app = app.replaceAll('heldenmobil:', 'heldenmobil-lab:');
app = app.replace("COMPANION_BACKUP_DB='HeldenMobilBackups'", "COMPANION_BACKUP_DB='HeldenMobilLabBackups'");

if (!app.includes('const HELDENMOBIL_LAB_MODE=true;')) {
  const marker = "  const CLOUD_CONFIG_KEY='heldenmobil-lab:onedrive:config:v1';";
  if (!app.includes(marker)) throw new Error('Cloud config marker not found');
  app = app.replace(marker, `  const HELDENMOBIL_LAB_MODE=true;\n${marker}`);
}

const productionCloudCapable = "function cloudCapable(){return location.protocol==='https:'||(location.protocol==='http:'&&['localhost','127.0.0.1','::1'].includes(location.hostname));}";
const labCloudCapable = "function cloudCapable(){return !HELDENMOBIL_LAB_MODE&&(location.protocol==='https:'||(location.protocol==='http:'&&['localhost','127.0.0.1','::1'].includes(location.hostname)));}";
if (app.includes(productionCloudCapable)) app = app.replace(productionCloudCapable, labCloudCapable);
if (!app.includes(labCloudCapable)) throw new Error('Lab cloud hard stop not installed');

app = app.replace('return `hero-${String(heroKey', 'return `lab-hero-${String(heroKey');
if (!app.includes('return `lab-hero-${String(heroKey')) throw new Error('Lab cloud filename isolation not installed');

const oldCloudError = "if(!cloudCapable()){cloudMessage('OneDrive-Anmeldung funktioniert aus Sicherheitsgründen nicht aus einer file://-Datei. Bitte HeldenMobil über HTTPS oder localhost öffnen.','error');return;}";
const newCloudError = "if(!cloudCapable()){cloudMessage(HELDENMOBIL_LAB_MODE?'HeldenMobil LAB: OneDrive ist absichtlich deaktiviert, damit keine Produktivdaten verändert werden.':'OneDrive-Anmeldung funktioniert aus Sicherheitsgründen nicht aus einer file://-Datei. Bitte HeldenMobil über HTTPS oder localhost öffnen.','error');return;}";
if (app.includes(oldCloudError)) app = app.replace(oldCloudError, newCloudError);
write('js/app.js', app);

// 2) Make it impossible to mistake the Lab page for production.
let index = read('index.html');
index = index.replace('<title>HeldenMobil – HLD PoC v20.3.2</title>', '<title>HeldenMobil LAB – HLD PoC v20.3.2</title>');
if (!index.includes('.lab-banner{')) {
  const styleMarker = 'header{display:flex;';
  if (!index.includes(styleMarker)) throw new Error('Header style marker not found');
  index = index.replace(styleMarker, '.lab-banner{position:sticky;top:0;z-index:9999;margin:0 0 14px;padding:8px 12px;border:1px solid #a46161;border-radius:10px;background:#361d1d;color:#ffd4d4;font-size:.78rem;font-weight:800;text-align:center;letter-spacing:.035em}\n' + styleMarker);
}
if (!index.includes('HELDENMOBIL LAB · EXPERIMENTAL')) {
  const bodyMatch = index.match(/<body[^>]*>/i);
  if (!bodyMatch) throw new Error('Body tag not found');
  index = index.replace(bodyMatch[0], bodyMatch[0] + '\n<div class="lab-banner">HELDENMOBIL LAB · EXPERIMENTAL · getrennte Browserdaten · OneDrive deaktiviert</div>');
}
write('index.html', index);

// 3) Repository metadata and regression tests.
let readme = read('README.md');
const notice = '> **HeldenMobil LAB** – experimenteller Entwicklungszweig auf Basis von HeldenMobil v20.3.2. Browserdaten und Backups sind vom Produktivsystem getrennt; OneDrive ist im Lab zunächst deaktiviert.\n\n';
if (!readme.startsWith('> **HeldenMobil LAB**')) readme = notice + readme;
write('README.md', readme);

const pkg = JSON.parse(read('package.json'));
pkg.name = 'heldenmobil-lab';
pkg.scripts.test = 'node tests/smoke.mjs && node tests/core.mjs && node tests/lab-isolation.mjs';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

let smoke = read('tests/smoke.mjs');
smoke = smoke.replace("COMPANION_BACKUP_DB='HeldenMobilBackups'", "COMPANION_BACKUP_DB='HeldenMobilLabBackups'");
write('tests/smoke.mjs', smoke);

write('tests/lab-isolation.mjs', `import fs from 'node:fs';\nimport assert from 'node:assert/strict';\nconst app=fs.readFileSync('js/app.js','utf8');\nconst index=fs.readFileSync('index.html','utf8');\nassert.match(app,/heldenmobil-lab:/);\nassert.doesNotMatch(app,/['\\\"\\\`]heldenmobil:/);\nassert.match(app,/HeldenMobilLabBackups/);\nassert.match(app,/const HELDENMOBIL_LAB_MODE=true;/);\nassert.match(app,/return !HELDENMOBIL_LAB_MODE/);\nassert.match(app,/lab-hero-/);\nassert.match(index,/HeldenMobil LAB/);\nassert.match(index,/HELDENMOBIL LAB · EXPERIMENTAL/);\nconsole.log('lab-isolation: OK');\n`);

console.log('HeldenMobil Lab isolation applied.');
