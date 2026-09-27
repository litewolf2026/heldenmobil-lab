import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const talent=require('../js/dsa41/talent-core.js');
const catalog=talent.ORDINARY_TALENTS;

// Independent static Golden contract.
// Source: Wege des Schwerts, DSA 4.1, 2nd edition 2011:
// printed pp. 19-41 (detailed talent entries), pp. 193-195 (inventory),
// and pp. 13-14 (substitution rules). These expectations are intentionally
// not generated from talent-core.js or ORDINARY_TALENTS.
//
// Project rule deviation: WdS describes situational eBE for Überreden
// (including BE-4 and BE*2 when begging in visible armor). HeldenMobil
// deliberately does NOT model/apply those encumbrance penalties. Therefore
// the Golden expectation for Überreden is encumbranceRule=null and
// encumbranceVariants=[].

const INVENTORY=[
  ['physical','Akrobatik','special',['MU','GE','KK']],
  ['physical','Athletik','basic',['GE','KO','KK']],
  ['physical','Fliegen','special',['MU','IN','GE']],
  ['physical','Gaukeleien','special',['MU','CH','FF']],
  ['physical','Klettern','basic',['MU','GE','KK']],
  ['physical','Körperbeherrschung','basic',['MU','IN','GE']],
  ['physical','Reiten','special',['CH','GE','KK']],
  ['physical','Schleichen','basic',['MU','IN','GE']],
  ['physical','Schwimmen','basic',['GE','KO','KK']],
  ['physical','Selbstbeherrschung','basic',['MU','KO','KK']],
  ['physical','Sich Verstecken','basic',['MU','IN','GE']],
  ['physical','Singen','basic',['IN','CH','CH']],
  ['physical','Sinnenschärfe','basic',['KL','IN','IN']],
  ['physical','Skifahren','special',['GE','GE','KO']],
  ['physical','Stimmen Imitieren','special',['KL','IN','CH']],
  ['physical','Tanzen','basic',['CH','GE','GE']],
  ['physical','Taschendiebstahl','special',['MU','IN','FF']],
  ['physical','Zechen','basic',['IN','KO','KK']],
  ['social','Betören','special',['IN','CH','CH']],
  ['social','Etikette','special',['KL','IN','CH']],
  ['social','Gassenwissen','special',['KL','IN','CH']],
  ['social','Lehren','special',['KL','IN','CH']],
  ['social','Menschenkenntnis','basic',['KL','IN','CH']],
  ['social','Schauspielerei','special',['MU','KL','CH']],
  ['social','Schriftlicher Ausdruck','special',['KL','IN','IN']],
  ['social','Sich Verkleiden','special',['MU','CH','GE']],
  ['social','Überreden','basic',['MU','IN','CH']],
  ['social','Überzeugen','special',['KL','IN','CH']],
  ['nature','Fährtensuchen','basic',['KL','IN','KO']],
  ['nature','Fallenstellen','special',['KL','FF','KK']],
  ['nature','Fesseln/Entfesseln','special',['FF','GE','KK']],
  ['nature','Fischen/Angeln','special',['IN','FF','KK']],
  ['nature','Orientierung','basic',['KL','IN','IN']],
  ['nature','Wettervorhersage','special',['KL','IN','IN']],
  ['nature','Wildnisleben','basic',['IN','GE','KO']],
  ['knowledge','Anatomie','special',['MU','KL','FF']],
  ['knowledge','Baukunst','special',['KL','KL','FF']],
  ['knowledge','Brett-/Kartenspiel','special',['KL','KL','IN']],
  ['knowledge','Geographie','special',['KL','KL','IN']],
  ['knowledge','Geschichtswissen','special',['KL','KL','IN']],
  ['knowledge','Gesteinskunde','special',['KL','IN','FF']],
  ['knowledge','Götter/Kulte','basic',['KL','KL','IN']],
  ['knowledge','Heraldik','special',['KL','KL','FF']],
  ['knowledge','Hüttenkunde','special',['KL','IN','KO']],
  ['knowledge','Kriegskunst','special',['MU','KL','CH']],
  ['knowledge','Kryptographie','special',['KL','KL','IN']],
  ['knowledge','Magiekunde','special',['KL','KL','IN']],
  ['knowledge','Mechanik','special',['KL','KL','FF']],
  ['knowledge','Pflanzenkunde','special',['KL','IN','FF']],
  ['knowledge','Philosophie','special',['KL','KL','IN']],
  ['knowledge','Rechnen','basic',['KL','KL','IN']],
  ['knowledge','Rechtskunde','special',['KL','KL','IN']],
  ['knowledge','Sagen/Legenden','basic',['KL','IN','CH']],
  ['knowledge','Schätzen','special',['KL','IN','IN']],
  ['knowledge','Sprachenkunde','special',['KL','KL','IN']],
  ['knowledge','Staatskunst','special',['KL','IN','CH']],
  ['knowledge','Sternkunde','special',['KL','KL','IN']],
  ['knowledge','Tierkunde','special',['MU','KL','IN']],
  ['craft','Abrichten','special',['MU','IN','CH']],
  ['craft','Ackerbau','special',['IN','FF','KO']],
  ['craft','Alchimie','special',['MU','KL','FF']],
  ['craft','Bergbau','special',['IN','KO','KK']],
  ['craft','Bogenbau','special',['KL','IN','FF']],
  ['craft','Boote Fahren','special',['GE','KO','KK']],
  ['craft','Brauer','special',['KL','FF','KK']],
  ['craft','Drucker','special',['KL','FF','KK']],
  ['craft','Fahrzeug Lenken','special',['IN','CH','FF']],
  ['craft','Falschspiel','special',['MU','CH','FF']],
  ['craft','Feinmechanik','special',['KL','FF','FF']],
  ['craft','Feuersteinbearbeitung','special',['KL','FF','FF']],
  ['craft','Fleischer','special',['KL','FF','KK']],
  ['craft','Gerber/Kürschner','special',['KL','FF','KO']],
  ['craft','Glaskunst','special',['FF','FF','KO']],
  ['craft','Grobschmied','special',['FF','KO','KK']],
  ['craft','Handel','special',['KL','IN','CH']],
  ['craft','Hauswirtschaft','special',['IN','CH','FF']],
  ['craft','Heilkunde Gift','special',['MU','KL','IN']],
  ['craft','Heilkunde Krankheiten','special',['MU','KL','CH']],
  ['craft','Heilkunde Seele','special',['IN','CH','CH']],
  ['craft','Heilkunde Wunden','basic',['KL','CH','FF']],
  ['craft','Holzbearbeitung','basic',['KL','FF','KK']],
  ['craft','Instrumentenbauer','special',['KL','IN','FF']],
  ['craft','Kartographie','special',['KL','KL','FF']],
  ['craft','Kochen','basic',['KL','IN','FF']],
  ['craft','Kristallzucht','special',['KL','IN','FF']],
  ['craft','Lederarbeiten','basic',['KL','FF','FF']],
  ['craft','Malen/Zeichnen','basic',['KL','IN','FF']],
  ['craft','Maurer','special',['FF','GE','KK']],
  ['craft','Metallguss','special',['KL','FF','KK']],
  ['craft','Musizieren','special',['IN','CH','FF']],
  ['craft','Schlösser Knacken','special',['IN','FF','FF']],
  ['craft','Schnaps Brennen','special',['KL','IN','FF']],
  ['craft','Schneidern','basic',['KL','FF','FF']],
  ['craft','Seefahrt','special',['FF','GE','KK']],
  ['craft','Seiler','special',['FF','FF','KK']],
  ['craft','Steinmetz','special',['FF','FF','KK']],
  ['craft','Steinschneider/Juwelier','special',['IN','FF','FF']],
  ['craft','Stellmacher','special',['KL','FF','KK']],
  ['craft','Stoffe Färben','special',['KL','FF','KK']],
  ['craft','Tätowieren','special',['IN','FF','FF']],
  ['craft','Töpfern','special',['KL','FF','FF']],
  ['craft','Viehzucht','special',['KL','IN','KK']],
  ['craft','Webkunst','special',['FF','FF','KK']],
  ['craft','Winzer','special',['KL','FF','KK']],
  ['craft','Zimmermann','special',['KL','FF','KK']]
];

const ALIASES={
  'Sinnenschärfe':['Sinnesschärfe'],
  'Fallenstellen':['Fallen stellen'],
  'Fesseln/Entfesseln':['Fesseln'],
  'Brett-/Kartenspiel':['Brettspiel','Brett/Kartenspiel'],
  'Geographie':['Geografie'],
  'Götter/Kulte':['Götter und Kulte'],
  'Sagen/Legenden':['Sagen und Legenden'],
  'Heilkunde Gift':['Heilkunde: Gift'],
  'Heilkunde Krankheiten':['Heilkunde Krankheit','Heilkunde: Krankheiten'],
  'Heilkunde Seele':['Heilkunde: Seele'],
  'Heilkunde Wunden':['Heilkunde: Wunden'],
  'Kartographie':['Kartografie'],
  'Kristallzucht':['Kristallzüchter'],
  'Steinschneider/Juwelier':['Steinschneider','Juwelier']
};

const FIXED_EBE={
  Akrobatik:'BE*2',Athletik:'BE*2',Fliegen:'BE',Gaukeleien:'BE*2',Klettern:'BE*2',
  Körperbeherrschung:'BE*2',Reiten:'BE-2',Schleichen:'BE',Schwimmen:'BE*2',
  'Sich Verstecken':'BE-2',Singen:'BE-3',Skifahren:'BE-2','Stimmen Imitieren':'BE-4',
  Tanzen:'BE*2',Taschendiebstahl:'BE*2',Betören:'BE-2',Etikette:'BE-2',Gassenwissen:'BE-4'
};

const EBE_VARIANTS={
  Sinnenschärfe:[{rule:'BE',condition:'Situationsabhängige Obergrenze bei eingeschränkter Wahrnehmung.'}],
  'Sich Verkleiden':[{rule:'BE*2',condition:'Situationsabhängige Obergrenze; je nach Verkleidung auch keine eBE.'}],
  Überzeugen:[{rule:'BE-4',condition:'Nur wenn die Situation die Rüstung relevant macht.'}],
  'Fesseln/Entfesseln':[{rule:'BE',condition:'Entfesseln; beim Fesseln normalerweise keine eBE.'}],
  'Fischen/Angeln':[{rule:'BE',condition:'Bestimmte Formen des Angelns; sonst keine pauschale eBE.'}]
};

const CRAFT_EBE_NOTE='Situationsabhängig nach Tätigkeit und Ausrüstung; WdS S. 32–33 nennt keine pauschale eBE-Formel.';
const EBE_NOTES={
  Schauspielerei:'Die eBE richtet sich nach der verkörperten Rolle; keine pauschale Formel.',
  Fährtensuchen:'Normalerweise keine eBE; eingeschränkte Wahrnehmung durch Kleidung oder Rüstung ist situativ zu beurteilen.',
  Orientierung:'Keine pauschale eBE; ein Helm mit eingeschränktem Blickfeld kann situativ bis zu +3 verursachen.',
  Wildnisleben:'Situativ; beim Erkennen und Einschätzen keine eBE.'
};

const SUBS={
  Akrobatik:[['Körperbeherrschung',5],['Athletik',10]],
  Athletik:[['Körperbeherrschung',5],['Akrobatik',10]],
  Fliegen:[['Akrobatik',10]],
  Gaukeleien:[['Falschspiel',10],['Taschendiebstahl',10]],
  Klettern:[['Akrobatik',5],['Athletik',5],['Körperbeherrschung',10]],
  Körperbeherrschung:[['Akrobatik',5],['Athletik',10]],
  Reiten:[['Körperbeherrschung',10],['Akrobatik',15]],
  Schleichen:[['Körperbeherrschung',10],['Sich Verstecken',10]],
  Schwimmen:[['Athletik',10]],
  'Sich Verstecken':[['Schleichen',10],['Körperbeherrschung',15]],
  Skifahren:[['Athletik',10],['Körperbeherrschung',15]],
  'Stimmen Imitieren':[['Gaukeleien',5,'Bauchreden']],
  Tanzen:[['Akrobatik',5],['Körperbeherrschung',5]],
  Taschendiebstahl:[['Gaukeleien',10,'Taschenspielereien']],
  Betören:[['Überreden',10],['Überzeugen',10]],
  Gassenwissen:[['Menschenkenntnis',10]],
  Lehren:[['Überzeugen',10]],
  Menschenkenntnis:[['Heilkunde Seele',5]],
  Schauspielerei:[['Überreden',10]],
  'Schriftlicher Ausdruck':[['Überzeugen',5,'schriftliche Rhetorik']],
  'Sich Verkleiden':[['Schauspielerei',10]],
  Überreden:[['Überzeugen',10]],
  Überzeugen:[['Überreden',10]],
  Fährtensuchen:[['Sinnenschärfe',10]],
  Fallenstellen:[['Wildnisleben',10]],
  'Fesseln/Entfesseln':[
    ['Seefahrt',10],['Seiler',10],
    ['Akrobatik',5,'Winden','Nur Entfesseln.'],
    ['Gaukeleien',10,null,'Nur Entfesseln mit einer vom SL als passend bestimmten Spezialisierung.'],
    ['Taschendiebstahl',10,null,'Nur Entfesseln.']
  ],
  'Fischen/Angeln':[['Wildnisleben',10]],
  Orientierung:[['Sternkunde',10]],
  Wettervorhersage:[['Wildnisleben',10]],
  Wildnisleben:[['Tierkunde',10],['Pflanzenkunde',10]],
  Anatomie:[['Heilkunde Wunden',5],['Heilkunde Krankheiten',10]],
  Baukunst:[['Zimmermann',10],['Maurer',10],['Steinmetz',10]],
  'Brett-/Kartenspiel':[['Kriegskunst',10,'Strategie'],['Rechnen',10]],
  Geographie:[['Sagen/Legenden',10]],
  Geschichtswissen:[['Sagen/Legenden',10]],
  Gesteinskunde:[['Steinmetz',5],['Bergbau',10],['Baukunst',10],['Steinschneider/Juwelier',10],['Hüttenkunde',10]],
  'Götter/Kulte':[['Geschichtswissen',10],['Sagen/Legenden',10]],
  Heraldik:[['Etikette',10]],
  Hüttenkunde:[['Alchimie',10],['Metallguss',10],['Grobschmied',15]],
  Kriegskunst:[
    ['Brett-/Kartenspiel',10,null,'Strategische Entscheidungen.'],
    ['Rechnen',null,null,'Situationsabhängig; WdS nennt keinen festen Zuschlag.'],
    ['Menschenkenntnis',null,null,'Situationsabhängig; WdS nennt keinen festen Zuschlag.'],
    ['Tierkunde',null,null,'Kampf gegen Monstren; WdS nennt keinen festen Zuschlag.']
  ],
  Kryptographie:[['Rechnen',10],['Sprachenkunde',10]],
  Magiekunde:[
    ['Sagen/Legenden',10,null,'Insbesondere Dämonologie, Elementarismus und Zauberpraxis.'],
    ['Götter/Kulte',10,null,'Sphärologie.']
  ],
  Mechanik:[['Feinmechanik',10]],
  Pflanzenkunde:[['Wildnisleben',10]],
  Philosophie:[['Götter/Kulte',10],['Magiekunde',10],['Geschichtswissen',15],['Sagen/Legenden',15]],
  Rechtskunde:[['Etikette',10],['Staatskunst',10]],
  'Sagen/Legenden':[['Geschichtswissen',10],['Götter/Kulte',10]],
  Schätzen:[['Feinmechanik',5,'Goldschmied'],['Handel',5],['Steinschneider/Juwelier',5]],
  Staatskunst:[['Hauswirtschaft',10],['Rechtskunde',10,'Staatsrecht']],
  Tierkunde:[['Reiten',10],['Viehzucht',10],['Wildnisleben',10]],
  Abrichten:[['Reiten',10],['Tierkunde',10],['Viehzucht',10]],
  Ackerbau:[['Viehzucht',10],['Pflanzenkunde',10]],
  Alchimie:[['Kochen',10,'Tränke'],['Pflanzenkunde',10]],
  Bergbau:[['Baukunst',10],['Gesteinskunde',10],['Maurer',10],['Steinmetz',10]],
  Bogenbau:[['Holzbearbeitung',10],['Grobschmied',15,null,'Nur Armbrüste.'],['Feinmechanik',10,null,'Nur Armbrüste.']],
  'Boote Fahren':[['Seefahrt',5]],
  Brauer:[['Alchimie',10]],
  Drucker:[['Mechanik',10],['Alchimie',10],['Stoffe Färben',10],['Metallguss',15]],
  Falschspiel:[['Gaukeleien',10,'Taschenspielereien']],
  Feuersteinbearbeitung:[['Steinmetz',10]],
  Fleischer:[['Anatomie',10],['Fischen/Angeln',10],['Kochen',10],['Tierkunde',10],['Viehzucht',10],['Gerber/Kürschner',10,'Trophäen']],
  'Gerber/Kürschner':[['Alchimie',10],['Fleischer',10]],
  Glaskunst:[['Steinschneider/Juwelier',10]],
  Grobschmied:[['Metallguss',15]],
  Handel:[['Hauswirtschaft',10],['Geographie',15],['Schätzen',15]],
  Hauswirtschaft:[['Rechnen',10,'Buchführung']],
  'Heilkunde Gift':[['Alchimie',5,'Gifte'],['Heilkunde Krankheiten',10],['Kochen',10,'Tränke']],
  'Heilkunde Krankheiten':[['Heilkunde Gift',10]],
  'Heilkunde Seele':[['Menschenkenntnis',10],['Überzeugen',10]],
  'Heilkunde Wunden':[['Anatomie',10]],
  Holzbearbeitung:[['Zimmermann',5]],
  Instrumentenbauer:[['Holzbearbeitung',10],['Feinmechanik',10]],
  Kartographie:[['Orientierung',10],['Sternkunde',10]],
  Kochen:[['Alchimie',10,null,'Nur für die Verwendung Kochen (Tränke).'],['Fleischer',10],['Fischen/Angeln',10],['Wildnisleben',10]],
  Kristallzucht:[['Alchimie',15]],
  Lederarbeiten:[['Gerber/Kürschner',10],['Schneidern',10]],
  'Malen/Zeichnen':[['Kartographie',10],['Steinmetz',10,'Bildhauer'],['Tätowieren',5]],
  Maurer:[['Baukunst',10]],
  Metallguss:[['Hüttenkunde',10],['Grobschmied',10]],
  'Schlösser Knacken':[['Feinmechanik',5]],
  'Schnaps Brennen':[['Alchimie',5],['Brauer',10],['Winzer',10]],
  Schneidern:[['Lederarbeiten',10],['Webkunst',10]],
  Seefahrt:[['Boote Fahren',10]],
  Seiler:[['Fesseln/Entfesseln',10,'Taue Spleißen']],
  Steinmetz:[['Baukunst',10],['Bergbau',10],['Malen/Zeichnen',10],['Maurer',10]],
  'Steinschneider/Juwelier':[['Feinmechanik',10],['Kristallzucht',10]],
  Stellmacher:[['Zimmermann',10]],
  'Stoffe Färben':[['Alchimie',10],['Drucker',10,null,'Nur Stoffdruck.']],
  Tätowieren:[['Malen/Zeichnen',10]],
  Töpfern:[['Maurer',10],['Steinmetz',10]],
  Viehzucht:[['Tierkunde',10]],
  Webkunst:[['Schneidern',10]],
  Zimmermann:[['Holzbearbeitung',10]]
};

function expectedKey(name){
  const slug=name.toLocaleLowerCase('de-DE')
    .replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue').replaceAll('ß','ss')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return 'talent.'+slug;
}
function subFromTuple([talentName,penalty,specialization=null,condition=null]){
  return {
    talent:talentName,
    penalty,
    ...(specialization?{specialization}:{}),
    ...(condition?{condition}:{})
  };
}
function sortStrings(values){return [...values].sort((a,b)=>a.localeCompare(b,'de'));}
function sortObjects(values){return [...values].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'de'));}

const GOLDEN=INVENTORY.map(([group,name,type,defaultAttributes])=>({
  key:expectedKey(name),
  name,
  aliases:sortStrings(ALIASES[name]||[]),
  group,
  type,
  resolutionMode:'TALENT',
  defaultAttributes,
  encumbranceRule:FIXED_EBE[name]??null,
  ...(group==='craft'||EBE_NOTES[name]?{encumbranceNote:group==='craft'?CRAFT_EBE_NOTE:EBE_NOTES[name]}:{}),
  encumbranceVariants:sortObjects(EBE_VARIANTS[name]||[]),
  substitutes:sortObjects((SUBS[name]||[]).map(subFromTuple))
}));

function project(def){
  return {
    key:def.key,
    name:def.name,
    aliases:sortStrings(def.aliases||[]),
    group:def.group,
    type:def.type,
    resolutionMode:def.resolutionMode,
    defaultAttributes:[...(def.defaultAttributes||[])],
    encumbranceRule:def.encumbranceRule??null,
    ...('encumbranceNote' in def?{encumbranceNote:def.encumbranceNote}:{}),
    encumbranceVariants:sortObjects((def.encumbranceVariants||[]).map(x=>({...x}))),
    substitutes:sortObjects((def.substitutes||[]).map(x=>({...x})))
  };
}
function sorted(values){return [...values].sort((a,b)=>a.key.localeCompare(b.key,'de'));}
function assertGolden(values){
  assert.deepEqual(sorted(values.map(project)),sorted(GOLDEN));
}

assert.equal(GOLDEN.length,105,'Golden catalog must contain exactly 105 E1 talents');
assert.equal(new Set(GOLDEN.map(x=>x.key)).size,105,'Golden stable keys must be unique');
assert.equal(new Set(GOLDEN.map(x=>x.name)).size,105,'Golden canonical names must be unique');
assert.deepEqual(
  Object.fromEntries(['physical','social','nature','knowledge','craft'].map(group=>[group,GOLDEN.filter(x=>x.group===group).length])),
  {physical:18,social:10,nature:7,knowledge:23,craft:47}
);
assert.equal(GOLDEN.filter(x=>x.type==='basic').length,25);
assert.equal(GOLDEN.filter(x=>x.type==='special').length,80);

// Full production-vs-independent-Golden comparison.
assertGolden(catalog);

// Explicit project deviation: these WdS situational armor penalties are deliberately not cataloged/applied.
const goldenPersuasion=GOLDEN.find(x=>x.name==='Überreden');
assert.deepEqual([goldenPersuasion.encumbranceRule,goldenPersuasion.encumbranceVariants],[null,[]]);

// Out-of-scope references must not leak into the E1 Golden substitutions.
const goldenNames=new Set(GOLDEN.map(x=>x.name));
for(const def of GOLDEN)for(const sub of def.substitutes)assert.ok(goldenNames.has(sub.talent),def.name+': substitute must remain inside E1');
for(const outside of ['Schwerter','Bogen','Ringen','Prophezeien','Sprachen [Fremdsprache]','Lesen/Schreiben [Schrift]']){
  assert.ok(!goldenNames.has(outside),outside+': outside E1');
}

// Prove the comparator catches one-field regressions instead of only validating shape.
const baseline=catalog.map(project);
function proveMutation(label,mutate){
  const copy=structuredClone(baseline);
  mutate(copy);
  assert.throws(()=>assertGolden(copy),undefined,'Golden comparator must reject '+label);
}
const row=name=>baseline.findIndex(x=>x.name===name);
proveMutation('canonical name',copy=>{copy[row('Akrobatik')].name='Akrobatik!';});
proveMutation('group',copy=>{copy[row('Athletik')].group='knowledge';});
proveMutation('basic/special type',copy=>{copy[row('Klettern')].type='special';});
proveMutation('property triple',copy=>{copy[row('Fährtensuchen')].defaultAttributes[2]='IN';});
proveMutation('alias',copy=>{copy[row('Sinnenschärfe')].aliases=[];});
proveMutation('fixed eBE',copy=>{copy[row('Akrobatik')].encumbranceRule='BE';});
proveMutation('conditional eBE',copy=>{copy[row('Sinnenschärfe')].encumbranceVariants=[];});
proveMutation('eBE note',copy=>{copy[row('Wildnisleben')].encumbranceNote='changed';});
proveMutation('substitute talent',copy=>{copy[row('Anatomie')].substitutes[0].talent='Kochen';});
proveMutation('substitute penalty',copy=>{copy[row('Anatomie')].substitutes[0].penalty=99;});
proveMutation('substitute specialization',copy=>{copy[row('Stimmen Imitieren')].substitutes[0].specialization='Jonglieren';});
proveMutation('substitute condition',copy=>{copy[row('Fesseln/Entfesseln')].substitutes.find(x=>x.talent==='Akrobatik').condition='changed';});
proveMutation('resolution mode',copy=>{copy[row('Kochen')].resolutionMode='PROFICIENCY';});
proveMutation('stable key',copy=>{copy[row('Schlösser Knacken')].key='talent.changed';});

console.log('TALENT-QA1.R1 Golden passed: 105 independent E1 records; full metadata and mutation sensitivity');
