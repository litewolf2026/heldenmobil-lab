(function(root,factory){
  const checks=typeof module==='object'&&module.exports?require('./check-core.js'):root.HeldenMobilDsa41Check;
  const api=factory(checks);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Talent=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(checks){
  'use strict';
  if(!checks)throw new Error('check core is required');

  const TALENT_TYPE=Object.freeze({BASIC:'basic',SPECIAL:'special'});
  const TALENT_GROUP=Object.freeze({PHYSICAL:'physical',SOCIAL:'social',NATURE:'nature',KNOWLEDGE:'knowledge',CRAFT:'craft'});
  // PROFICIENCY and COMBAT reserve contract values only; E1 resolves TALENT.
  const RESOLUTION_MODE=Object.freeze({TALENT:'TALENT',PROFICIENCY:'PROFICIENCY',COMBAT:'COMBAT'});
  const AVAILABILITY=Object.freeze({AVAILABLE:'available',UNACTIVATED_SPECIAL:'unactivated-special',SPECIAL_VALUE_NEGATIVE:'special-value-negative',BASIC_VALUE_MISSING:'basic-value-missing',UNKNOWN_TALENT:'unknown-talent'});
  const ATTRIBUTES=new Set(['MU','KL','IN','CH','FF','GE','KO','KK']);

  const n=(value,label)=>{const out=Number(value);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;};
  const norm=(value)=>String(value??'').trim().toLocaleLowerCase('de-DE');
  const list=(value)=>Array.isArray(value)?value:[];
  function attributeTriplet(values,label='attributes'){
    if(!Array.isArray(values)||values.length!==3)throw new TypeError(`${label} must contain exactly three attribute keys`);
    return values.map((value,index)=>{const key=String(value||'').trim().toUpperCase();if(!ATTRIBUTES.has(key))throw new RangeError(`${label}[${index}] is not a DSA attribute key`);return key;});
  }
  function probeAttributeKeys(probe){
    const keys=(String(probe||'').toUpperCase().match(/MU|KL|IN|CH|FF|GE|KO|KK/g)||[]).slice(0,3);
    return keys.length===3?keys:[];
  }
  function freezeDefinition(def){
    return Object.freeze({
      key:String(def.key),name:String(def.name),aliases:Object.freeze([...(def.aliases||[])]),group:def.group,type:def.type,resolutionMode:def.resolutionMode,
      defaultAttributes:Object.freeze([...(def.defaultAttributes||[])]),encumbranceRule:def.encumbranceRule??null,
      ...(def.encumbranceNote?{encumbranceNote:def.encumbranceNote}:{}),
      encumbranceVariants:Object.freeze((def.encumbranceVariants||[]).map(x=>Object.freeze({...x}))),
      substitutes:Object.freeze((def.substitutes||[]).map(x=>Object.freeze({talent:String(x.talent),penalty:x.penalty==null?null:Number(x.penalty),...substitutionContext(x)})))
    });
  }
  function substitutionContext(sub){
    return {...(sub.specialization?{specialization:String(sub.specialization)}:{}),...(sub.condition?{condition:String(sub.condition)}:{})};
  }
  function sub(talent,penalty,specialization=null,condition=null){return {talent,penalty,specialization,condition};}
  function groupDefinitions(group,definitions){
    return definitions.map(def=>freezeDefinition({group,resolutionMode:RESOLUTION_MODE.TALENT,
      ...(group===TALENT_GROUP.CRAFT?{encumbranceNote:'Situationsabhängig nach Tätigkeit und Ausrüstung; WdS S. 32–33 nennt keine pauschale eBE-Formel.'}:{}),...def}));
  }

  // WdS, 2nd edition 2011, pp. 19–41 and 193–195. Detailed entries take
  // precedence over abbreviated/erroneous overview rows; see docs/talent-e1-catalog.md.
  // Conditional eBE variants and substitutes are metadata, never selected here.
  const ORDINARY_TALENTS=Object.freeze([
    ...groupDefinitions(TALENT_GROUP.PHYSICAL,[
      {key:'talent.akrobatik',name:'Akrobatik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','GE','KK'],encumbranceRule:'BE*2',substitutes:[sub('Körperbeherrschung',5),sub('Athletik',10)]},
      {key:'talent.athletik',name:'Athletik',type:TALENT_TYPE.BASIC,defaultAttributes:['GE','KO','KK'],encumbranceRule:'BE*2',substitutes:[sub('Körperbeherrschung',5),sub('Akrobatik',10)]},
      {key:'talent.fliegen',name:'Fliegen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE',substitutes:[sub('Akrobatik',10)]},
      {key:'talent.gaukeleien',name:'Gaukeleien',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','CH','FF'],encumbranceRule:'BE*2',substitutes:[sub('Falschspiel',10),sub('Taschendiebstahl',10)]},
      {key:'talent.klettern',name:'Klettern',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','GE','KK'],encumbranceRule:'BE*2',substitutes:[sub('Akrobatik',5),sub('Athletik',5),sub('Körperbeherrschung',10)]},
      {key:'talent.koerperbeherrschung',name:'Körperbeherrschung',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE*2',substitutes:[sub('Akrobatik',5),sub('Athletik',10)]},
      {key:'talent.reiten',name:'Reiten',type:TALENT_TYPE.SPECIAL,defaultAttributes:['CH','GE','KK'],encumbranceRule:'BE-2',substitutes:[sub('Körperbeherrschung',10),sub('Akrobatik',15)]},
      {key:'talent.schleichen',name:'Schleichen',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE',substitutes:[sub('Körperbeherrschung',10),sub('Sich Verstecken',10)]},
      {key:'talent.schwimmen',name:'Schwimmen',type:TALENT_TYPE.BASIC,defaultAttributes:['GE','KO','KK'],encumbranceRule:'BE*2',substitutes:[sub('Athletik',10)]},
      {key:'talent.selbstbeherrschung',name:'Selbstbeherrschung',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','KO','KK']},
      {key:'talent.sich-verstecken',name:'Sich Verstecken',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE-2',substitutes:[sub('Schleichen',10),sub('Körperbeherrschung',15)]},
      {key:'talent.singen',name:'Singen',type:TALENT_TYPE.BASIC,defaultAttributes:['IN','CH','CH'],encumbranceRule:'BE-3'},
      {key:'talent.sinnenschaerfe',name:'Sinnenschärfe',aliases:['Sinnesschärfe'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','IN'],encumbranceVariants:[{rule:'BE',condition:'Situationsabhängige Obergrenze bei eingeschränkter Wahrnehmung.'}]},
      {key:'talent.skifahren',name:'Skifahren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['GE','GE','KO'],encumbranceRule:'BE-2',substitutes:[sub('Athletik',10),sub('Körperbeherrschung',15)]},
      {key:'talent.stimmen-imitieren',name:'Stimmen Imitieren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceRule:'BE-4',substitutes:[sub('Gaukeleien',5,'Bauchreden')]},
      {key:'talent.tanzen',name:'Tanzen',type:TALENT_TYPE.BASIC,defaultAttributes:['CH','GE','GE'],encumbranceRule:'BE*2',substitutes:[sub('Akrobatik',5),sub('Körperbeherrschung',5)]},
      {key:'talent.taschendiebstahl',name:'Taschendiebstahl',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','IN','FF'],encumbranceRule:'BE*2',substitutes:[sub('Gaukeleien',10,'Taschenspielereien')]},
      {key:'talent.zechen',name:'Zechen',type:TALENT_TYPE.BASIC,defaultAttributes:['IN','KO','KK']}
    ]),
    ...groupDefinitions(TALENT_GROUP.SOCIAL,[
      {key:'talent.betoeren',name:'Betören',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','CH'],encumbranceRule:'BE-2',substitutes:[sub('Überreden',10),sub('Überzeugen',10)]},
      {key:'talent.etikette',name:'Etikette',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceRule:'BE-2'},
      {key:'talent.gassenwissen',name:'Gassenwissen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceRule:'BE-4',substitutes:[sub('Menschenkenntnis',10)]},
      {key:'talent.lehren',name:'Lehren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Überzeugen',10)]},
      {key:'talent.menschenkenntnis',name:'Menschenkenntnis',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Heilkunde Seele',5)]},
      {key:'talent.schauspielerei',name:'Schauspielerei',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','CH'],encumbranceNote:'Die eBE richtet sich nach der verkörperten Rolle; keine pauschale Formel.',substitutes:[sub('Überreden',10)]},
      {key:'talent.schriftlicher-ausdruck',name:'Schriftlicher Ausdruck',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','IN'],substitutes:[sub('Überzeugen',5,'schriftliche Rhetorik')]},
      {key:'talent.sich-verkleiden',name:'Sich Verkleiden',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','CH','GE'],encumbranceVariants:[{rule:'BE*2',condition:'Situationsabhängige Obergrenze; je nach Verkleidung auch keine eBE.'}],substitutes:[sub('Schauspielerei',10)]},
      {key:'talent.ueberreden',name:'Überreden',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','CH'],substitutes:[sub('Überzeugen',10)]},
      {key:'talent.ueberzeugen',name:'Überzeugen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceVariants:[{rule:'BE-4',condition:'Nur wenn die Situation die Rüstung relevant macht.'}],substitutes:[sub('Überreden',10)]}
    ]),
    ...groupDefinitions(TALENT_GROUP.NATURE,[
      {key:'talent.faehrtensuchen',name:'Fährtensuchen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','KO'],encumbranceNote:'Normalerweise keine eBE; eingeschränkte Wahrnehmung durch Kleidung oder Rüstung ist situativ zu beurteilen.',substitutes:[sub('Sinnenschärfe',10)]},
      {key:'talent.fallenstellen',name:'Fallenstellen',aliases:['Fallen stellen'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Wildnisleben',10)]},
      {key:'talent.fesseln-entfesseln',name:'Fesseln/Entfesseln',aliases:['Fesseln'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','GE','KK'],encumbranceVariants:[{rule:'BE',condition:'Entfesseln; beim Fesseln normalerweise keine eBE.'}],substitutes:[sub('Seefahrt',10),sub('Seiler',10),sub('Akrobatik',5,'Winden','Nur Entfesseln.'),sub('Gaukeleien',10,null,'Nur Entfesseln mit einer vom SL als passend bestimmten Spezialisierung.'),sub('Taschendiebstahl',10,null,'Nur Entfesseln.')]},
      {key:'talent.fischen-angeln',name:'Fischen/Angeln',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','KK'],encumbranceVariants:[{rule:'BE',condition:'Bestimmte Formen des Angelns; sonst keine pauschale eBE.'}],substitutes:[sub('Wildnisleben',10)]},
      {key:'talent.orientierung',name:'Orientierung',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','IN'],encumbranceNote:'Keine pauschale eBE; ein Helm mit eingeschränktem Blickfeld kann situativ bis zu +3 verursachen.',substitutes:[sub('Sternkunde',10)]},
      {key:'talent.wettervorhersage',name:'Wettervorhersage',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','IN'],substitutes:[sub('Wildnisleben',10)]},
      {key:'talent.wildnisleben',name:'Wildnisleben',type:TALENT_TYPE.BASIC,defaultAttributes:['IN','GE','KO'],encumbranceNote:'Situativ; beim Erkennen und Einschätzen keine eBE.',substitutes:[sub('Tierkunde',10),sub('Pflanzenkunde',10)]}
    ]),
    ...groupDefinitions(TALENT_GROUP.KNOWLEDGE,[
      {key:'talent.anatomie',name:'Anatomie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','FF'],substitutes:[sub('Heilkunde Wunden',5),sub('Heilkunde Krankheiten',10)]},
      {key:'talent.baukunst',name:'Baukunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Zimmermann',10),sub('Maurer',10),sub('Steinmetz',10)]},
      {key:'talent.brett-kartenspiel',name:'Brett-/Kartenspiel',aliases:['Brettspiel','Brett/Kartenspiel'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Kriegskunst',10,'Strategie'),sub('Rechnen',10)]},
      {key:'talent.geographie',name:'Geographie',aliases:['Geografie'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Sagen/Legenden',10)]},
      {key:'talent.geschichtswissen',name:'Geschichtswissen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Sagen/Legenden',10)]},
      {key:'talent.gesteinskunde',name:'Gesteinskunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Steinmetz',5),sub('Bergbau',10),sub('Baukunst',10),sub('Steinschneider/Juwelier',10),sub('Hüttenkunde',10)]},
      {key:'talent.goetter-kulte',name:'Götter/Kulte',aliases:['Götter und Kulte'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Geschichtswissen',10),sub('Sagen/Legenden',10)]},
      {key:'talent.heraldik',name:'Heraldik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Etikette',10)]},
      {key:'talent.huettenkunde',name:'Hüttenkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','KO'],substitutes:[sub('Alchimie',10),sub('Metallguss',10),sub('Grobschmied',15)]},
      {key:'talent.kriegskunst',name:'Kriegskunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','CH'],substitutes:[sub('Brett-/Kartenspiel',10,null,'Strategische Entscheidungen.'),sub('Rechnen',null,null,'Situationsabhängig; WdS nennt keinen festen Zuschlag.'),sub('Menschenkenntnis',null,null,'Situationsabhängig; WdS nennt keinen festen Zuschlag.'),sub('Tierkunde',null,null,'Kampf gegen Monstren; WdS nennt keinen festen Zuschlag.')]},
      {key:'talent.kryptographie',name:'Kryptographie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Rechnen',10),sub('Sprachenkunde',10)]},
      {key:'talent.magiekunde',name:'Magiekunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Sagen/Legenden',10,null,'Insbesondere Dämonologie, Elementarismus und Zauberpraxis.'),sub('Götter/Kulte',10,null,'Sphärologie.')]},
      {key:'talent.mechanik',name:'Mechanik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Feinmechanik',10)]},
      {key:'talent.pflanzenkunde',name:'Pflanzenkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Wildnisleben',10)]},
      {key:'talent.philosophie',name:'Philosophie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Götter/Kulte',10),sub('Magiekunde',10),sub('Geschichtswissen',15),sub('Sagen/Legenden',15)]},
      {key:'talent.rechnen',name:'Rechnen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','KL','IN']},
      {key:'talent.rechtskunde',name:'Rechtskunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Etikette',10),sub('Staatskunst',10)]},
      {key:'talent.sagen-legenden',name:'Sagen/Legenden',aliases:['Sagen und Legenden'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Geschichtswissen',10),sub('Götter/Kulte',10)]},
      {key:'talent.schaetzen',name:'Schätzen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','IN'],substitutes:[sub('Feinmechanik',5,'Goldschmied'),sub('Handel',5),sub('Steinschneider/Juwelier',5)]},
      {key:'talent.sprachenkunde',name:'Sprachenkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN']},
      {key:'talent.staatskunst',name:'Staatskunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Hauswirtschaft',10),sub('Rechtskunde',10,'Staatsrecht')]},
      {key:'talent.sternkunde',name:'Sternkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN']},
      {key:'talent.tierkunde',name:'Tierkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','IN'],substitutes:[sub('Reiten',10),sub('Viehzucht',10),sub('Wildnisleben',10)]}
    ]),
    ...groupDefinitions(TALENT_GROUP.CRAFT,[
      {key:'talent.abrichten',name:'Abrichten',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','IN','CH'],substitutes:[sub('Reiten',10),sub('Tierkunde',10),sub('Viehzucht',10)]},
      {key:'talent.ackerbau',name:'Ackerbau',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','KO'],substitutes:[sub('Viehzucht',10),sub('Pflanzenkunde',10)]},
      {key:'talent.alchimie',name:'Alchimie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','FF'],substitutes:[sub('Kochen',10,'Tränke'),sub('Pflanzenkunde',10)]},
      {key:'talent.bergbau',name:'Bergbau',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','KO','KK'],substitutes:[sub('Baukunst',10),sub('Gesteinskunde',10),sub('Maurer',10),sub('Steinmetz',10)]},
      {key:'talent.bogenbau',name:'Bogenbau',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Holzbearbeitung',10),sub('Grobschmied',15,null,'Nur Armbrüste.'),sub('Feinmechanik',10,null,'Nur Armbrüste.')]},
      {key:'talent.boote-fahren',name:'Boote Fahren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['GE','KO','KK'],substitutes:[sub('Seefahrt',5)]},
      {key:'talent.brauer',name:'Brauer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Alchimie',10)]},
      {key:'talent.drucker',name:'Drucker',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Mechanik',10),sub('Alchimie',10),sub('Stoffe Färben',10),sub('Metallguss',15)]},
      {key:'talent.fahrzeug-lenken',name:'Fahrzeug Lenken',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','FF']},
      {key:'talent.falschspiel',name:'Falschspiel',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','CH','FF'],substitutes:[sub('Gaukeleien',10,'Taschenspielereien')]},
      {key:'talent.feinmechanik',name:'Feinmechanik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF']},
      {key:'talent.feuersteinbearbeitung',name:'Feuersteinbearbeitung',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Steinmetz',10)]},
      {key:'talent.fleischer',name:'Fleischer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Anatomie',10),sub('Fischen/Angeln',10),sub('Kochen',10),sub('Tierkunde',10),sub('Viehzucht',10),sub('Gerber/Kürschner',10,'Trophäen')]},
      {key:'talent.gerber-kuerschner',name:'Gerber/Kürschner',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KO'],substitutes:[sub('Alchimie',10),sub('Fleischer',10)]},
      {key:'talent.glaskunst',name:'Glaskunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KO'],substitutes:[sub('Steinschneider/Juwelier',10)]},
      {key:'talent.grobschmied',name:'Grobschmied',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','KO','KK'],substitutes:[sub('Metallguss',15)]},
      {key:'talent.handel',name:'Handel',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Hauswirtschaft',10),sub('Geographie',15),sub('Schätzen',15)]},
      {key:'talent.hauswirtschaft',name:'Hauswirtschaft',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','FF'],substitutes:[sub('Rechnen',10,'Buchführung')]},
      {key:'talent.heilkunde-gift',name:'Heilkunde Gift',aliases:['Heilkunde: Gift'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','IN'],substitutes:[sub('Alchimie',5,'Gifte'),sub('Heilkunde Krankheiten',10),sub('Kochen',10,'Tränke')]},
      {key:'talent.heilkunde-krankheiten',name:'Heilkunde Krankheiten',aliases:['Heilkunde Krankheit','Heilkunde: Krankheiten'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','CH'],substitutes:[sub('Heilkunde Gift',10)]},
      {key:'talent.heilkunde-seele',name:'Heilkunde Seele',aliases:['Heilkunde: Seele'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','CH'],substitutes:[sub('Menschenkenntnis',10),sub('Überzeugen',10)]},
      {key:'talent.heilkunde-wunden',name:'Heilkunde Wunden',aliases:['Heilkunde: Wunden'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','CH','FF'],substitutes:[sub('Anatomie',10)]},
      {key:'talent.holzbearbeitung',name:'Holzbearbeitung',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Zimmermann',5)]},
      {key:'talent.instrumentenbauer',name:'Instrumentenbauer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Holzbearbeitung',10),sub('Feinmechanik',10)]},
      {key:'talent.kartographie',name:'Kartographie',aliases:['Kartografie'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Orientierung',10),sub('Sternkunde',10)]},
      {key:'talent.kochen',name:'Kochen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Alchimie',10,null,'Nur für die Verwendung Kochen (Tränke).'),sub('Fleischer',10),sub('Fischen/Angeln',10),sub('Wildnisleben',10)]},
      {key:'talent.kristallzucht',name:'Kristallzucht',aliases:['Kristallzüchter'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Alchimie',15)]},
      {key:'talent.lederarbeiten',name:'Lederarbeiten',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Gerber/Kürschner',10),sub('Schneidern',10)]},
      {key:'talent.malen-zeichnen',name:'Malen/Zeichnen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Kartographie',10),sub('Steinmetz',10,'Bildhauer'),sub('Tätowieren',5)]},
      {key:'talent.maurer',name:'Maurer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','GE','KK'],substitutes:[sub('Baukunst',10)]},
      {key:'talent.metallguss',name:'Metallguss',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Hüttenkunde',10),sub('Grobschmied',10)]},
      {key:'talent.musizieren',name:'Musizieren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','FF']},
      {key:'talent.schloesser-knacken',name:'Schlösser Knacken',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[sub('Feinmechanik',5)]},
      {key:'talent.schnaps-brennen',name:'Schnaps Brennen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Alchimie',5),sub('Brauer',10),sub('Winzer',10)]},
      {key:'talent.schneidern',name:'Schneidern',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Lederarbeiten',10),sub('Webkunst',10)]},
      {key:'talent.seefahrt',name:'Seefahrt',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','GE','KK'],substitutes:[sub('Boote Fahren',10)]},
      {key:'talent.seiler',name:'Seiler',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KK'],substitutes:[sub('Fesseln/Entfesseln',10,'Taue Spleißen')]},
      {key:'talent.steinmetz',name:'Steinmetz',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KK'],substitutes:[sub('Baukunst',10),sub('Bergbau',10),sub('Malen/Zeichnen',10),sub('Maurer',10)]},
      {key:'talent.steinschneider-juwelier',name:'Steinschneider/Juwelier',aliases:['Steinschneider','Juwelier'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[sub('Feinmechanik',10),sub('Kristallzucht',10)]},
      {key:'talent.stellmacher',name:'Stellmacher',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Zimmermann',10)]},
      {key:'talent.stoffe-faerben',name:'Stoffe Färben',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Alchimie',10),sub('Drucker',10,null,'Nur Stoffdruck.')]},
      {key:'talent.taetowieren',name:'Tätowieren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[sub('Malen/Zeichnen',10)]},
      {key:'talent.toepfern',name:'Töpfern',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Maurer',10),sub('Steinmetz',10)]},
      {key:'talent.viehzucht',name:'Viehzucht',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','KK'],substitutes:[sub('Tierkunde',10)]},
      {key:'talent.webkunst',name:'Webkunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KK'],substitutes:[sub('Schneidern',10)]},
      {key:'talent.winzer',name:'Winzer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK']},
      {key:'talent.zimmermann',name:'Zimmermann',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Holzbearbeitung',10)]}
    ])
  ]);
  // Keep the TALENT-A API and catalog identity for existing callers.
  const CORE_TALENTS=ORDINARY_TALENTS;

  function getTalentDefinition(name,catalog=CORE_TALENTS){
    const wanted=norm(name);
    return list(catalog).find(def=>norm(def.key)===wanted||norm(def.name)===wanted||list(def.aliases).some(alias=>norm(alias)===wanted))||null;
  }
  function sameTalentName(left,right,catalog=CORE_TALENTS){
    if(norm(left)===norm(right))return true;
    const leftDef=getTalentDefinition(left,catalog),rightDef=getTalentDefinition(right,catalog);
    return !!(leftDef&&rightDef&&norm(leftDef.name)===norm(rightDef.name));
  }
  function findHeroTalent(heroTalents,name,catalog=CORE_TALENTS){return list(heroTalents).find(t=>sameTalentName(t?.name,name,catalog))||null;}
  function talentAvailability({name,heroTalents=[],catalog=CORE_TALENTS}={}){
    const definition=getTalentDefinition(name,catalog),talent=findHeroTalent(heroTalents,name,catalog);
    if(talent&&definition?.type===TALENT_TYPE.SPECIAL&&n(talent.value??0,'talent value')<0)return {status:AVAILABILITY.SPECIAL_VALUE_NEGATIVE,definition,talent};
    if(talent)return {status:AVAILABILITY.AVAILABLE,definition,talent};
    if(!definition)return {status:AVAILABILITY.UNKNOWN_TALENT,definition:null,talent:null};
    if(definition.type===TALENT_TYPE.SPECIAL)return {status:AVAILABILITY.UNACTIVATED_SPECIAL,definition,talent:null};
    return {status:AVAILABILITY.BASIC_VALUE_MISSING,definition,talent:null};
  }
  function substitutionOptions({name,heroTalents=[],catalog=CORE_TALENTS}={}){
    const definition=getTalentDefinition(name,catalog);if(!definition)return[];
    return definition.substitutes.map(sub=>({definition:sub,talent:findHeroTalent(heroTalents,sub.talent,catalog)})).filter(x=>x.talent).map(x=>({kind:'substitute',requestedTalent:definition.name,talent:x.talent,penalty:x.definition.penalty,...substitutionContext(x.definition)}));
  }
  function encumbrancePenalty(rule,be=0){
    const base=Math.max(0,n(be,'BE')),text=String(rule??'').trim().toUpperCase().replace(/\s+/g,'').replace(/\u00d7/g,'X');
    if(!text||text==='-'||text==='0'||text==='KEINE')return 0;
    if(text==='BE')return base;
    let match=text.match(/^BE(?:X|\*)(\d+(?:[.,]\d+)?)$/);if(match)return base*Number(match[1].replace(',','.'));
    match=text.match(/^(\d+(?:[.,]\d+)?)(?:X|\*)BE$/);if(match)return base*Number(match[1].replace(',','.'));
    match=text.match(/^BE-(\d+(?:[.,]\d+)?)$/);if(match)return Math.max(0,base-Number(match[1].replace(',','.')));
    match=text.match(/^BE\+(\d+(?:[.,]\d+)?)$/);if(match)return base+Number(match[1].replace(',','.'));
    if(/^\d+(?:[.,]\d+)?$/.test(text))return Number(text.replace(',','.'));
    throw new RangeError(`unsupported encumbrance rule: ${rule}`);
  }
  function specializationBonus(talent,requestedSpecialization){
    const wanted=norm(requestedSpecialization);if(!wanted)return 0;
    return list(talent?.specs).some(spec=>norm(spec)===wanted)?2:0;
  }
  function resolveAttributeKeys({talent,definition=null,override=null}={}){
    if(override!=null)return attributeTriplet(override,'attribute override');
    const fromTalent=probeAttributeKeys(talent?.probe);if(fromTalent.length===3)return fromTalent;
    const fromDefinition=definition?.defaultAttributes||[];return attributeTriplet(fromDefinition,'default attributes');
  }
  function attributeValues(attributes,keys){
    if(!attributes||typeof attributes!=='object')throw new TypeError('hero attributes are required');
    return keys.map(key=>n(attributes[key],`attribute ${key}`));
  }
  function resolveTalentCheck({talent,heroAttributes,modifier=0,be=0,attributeOverride=null,specialization=null,rolls,catalog=CORE_TALENTS}={}){
    if(!talent||typeof talent!=='object')throw new TypeError('activated talent record is required');
    const definition=getTalentDefinition(talent.name,catalog);
    if(definition?.resolutionMode!=null&&definition.resolutionMode!==RESOLUTION_MODE.TALENT)throw new RangeError(`unsupported talent resolution mode: ${definition.resolutionMode}`);
    const attributeKeys=resolveAttributeKeys({talent,definition,override:attributeOverride});
    const baseSkill=n(talent.value??0,'talent value');
    if(definition?.type===TALENT_TYPE.SPECIAL&&baseSkill<0)throw new RangeError(`special talent cannot be checked with negative TaW: ${definition.name}`);
    const specBonus=specializationBonus(talent,specialization),skill=baseSkill+specBonus;
    const rule=String(talent.be??'').trim()||(definition?.encumbranceRule??null),ebe=encumbrancePenalty(rule,be),externalModifier=n(modifier,'modifier'),totalModifier=externalModifier+ebe;
    const result=checks.checkTalent({values:attributeValues(heroAttributes,attributeKeys),skill,modifier:totalModifier,rolls});
    return {definition,attributeKeys,baseSkill,specializationBonus:specBonus,skill,encumbranceRule:rule,encumbrancePenalty:ebe,externalModifier,totalModifier,result};
  }

  return {TALENT_TYPE,TALENT_GROUP,RESOLUTION_MODE,AVAILABILITY,ORDINARY_TALENTS,CORE_TALENTS,getTalentDefinition,sameTalentName,findHeroTalent,talentAvailability,substitutionOptions,probeAttributeKeys,resolveAttributeKeys,encumbrancePenalty,specializationBonus,resolveTalentCheck};
});
