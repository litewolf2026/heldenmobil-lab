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
      name:String(def.name),aliases:Object.freeze([...(def.aliases||[])]),group:def.group,type:def.type,resolutionMode:def.resolutionMode,
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
      {name:'Akrobatik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','GE','KK'],encumbranceRule:'BE*2',substitutes:[sub('Körperbeherrschung',5),sub('Athletik',10)]},
      {name:'Athletik',type:TALENT_TYPE.BASIC,defaultAttributes:['GE','KO','KK'],encumbranceRule:'BE*2',substitutes:[sub('Körperbeherrschung',5),sub('Akrobatik',10)]},
      {name:'Fliegen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE',substitutes:[sub('Akrobatik',10)]},
      {name:'Gaukeleien',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','CH','FF'],encumbranceRule:'BE*2',substitutes:[sub('Falschspiel',10),sub('Taschendiebstahl',10)]},
      {name:'Klettern',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','GE','KK'],encumbranceRule:'BE*2',substitutes:[sub('Akrobatik',5),sub('Athletik',5),sub('Körperbeherrschung',10)]},
      {name:'Körperbeherrschung',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE*2',substitutes:[sub('Akrobatik',5),sub('Athletik',10)]},
      {name:'Reiten',type:TALENT_TYPE.SPECIAL,defaultAttributes:['CH','GE','KK'],encumbranceRule:'BE-2',substitutes:[sub('Körperbeherrschung',10),sub('Akrobatik',15)]},
      {name:'Schleichen',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE',substitutes:[sub('Körperbeherrschung',10),sub('Sich Verstecken',10)]},
      {name:'Schwimmen',type:TALENT_TYPE.BASIC,defaultAttributes:['GE','KO','KK'],encumbranceRule:'BE*2',substitutes:[sub('Athletik',10)]},
      {name:'Selbstbeherrschung',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','KO','KK']},
      {name:'Sich Verstecken',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE-2',substitutes:[sub('Schleichen',10),sub('Körperbeherrschung',15)]},
      {name:'Singen',type:TALENT_TYPE.BASIC,defaultAttributes:['IN','CH','CH'],encumbranceRule:'BE-3'},
      {name:'Sinnenschärfe',aliases:['Sinnesschärfe'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','IN'],encumbranceVariants:[{rule:'BE',condition:'Situationsabhängige Obergrenze bei eingeschränkter Wahrnehmung.'}]},
      {name:'Skifahren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['GE','GE','KO'],encumbranceRule:'BE-2',substitutes:[sub('Athletik',10),sub('Körperbeherrschung',15)]},
      {name:'Stimmen Imitieren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceRule:'BE-4',substitutes:[sub('Gaukeleien',5,'Bauchreden')]},
      {name:'Tanzen',type:TALENT_TYPE.BASIC,defaultAttributes:['CH','GE','GE'],encumbranceRule:'BE*2',substitutes:[sub('Akrobatik',5),sub('Körperbeherrschung',5)]},
      {name:'Taschendiebstahl',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','IN','FF'],encumbranceRule:'BE*2',substitutes:[sub('Gaukeleien',10,'Taschenspielereien')]},
      {name:'Zechen',type:TALENT_TYPE.BASIC,defaultAttributes:['IN','KO','KK']}
    ]),
    ...groupDefinitions(TALENT_GROUP.SOCIAL,[
      {name:'Betören',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','CH'],encumbranceRule:'BE-2',substitutes:[sub('Überreden',10),sub('Überzeugen',10)]},
      {name:'Etikette',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceRule:'BE-2'},
      {name:'Gassenwissen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceRule:'BE-4',substitutes:[sub('Menschenkenntnis',10)]},
      {name:'Lehren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Überzeugen',10)]},
      {name:'Menschenkenntnis',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Heilkunde Seele',5)]},
      {name:'Schauspielerei',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','CH'],encumbranceNote:'Die eBE richtet sich nach der verkörperten Rolle; keine pauschale Formel.',substitutes:[sub('Überreden',10)]},
      {name:'Schriftlicher Ausdruck',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','IN'],substitutes:[sub('Überzeugen',5,'schriftliche Rhetorik')]},
      {name:'Sich Verkleiden',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','CH','GE'],encumbranceVariants:[{rule:'BE*2',condition:'Situationsabhängige Obergrenze; je nach Verkleidung auch keine eBE.'}],substitutes:[sub('Schauspielerei',10)]},
      {name:'Überreden',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','CH'],substitutes:[sub('Überzeugen',10)]},
      {name:'Überzeugen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],encumbranceVariants:[{rule:'BE-4',condition:'Nur wenn die Situation die Rüstung relevant macht.'}],substitutes:[sub('Überreden',10)]}
    ]),
    ...groupDefinitions(TALENT_GROUP.NATURE,[
      {name:'Fährtensuchen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','KO'],encumbranceNote:'Normalerweise keine eBE; eingeschränkte Wahrnehmung durch Kleidung oder Rüstung ist situativ zu beurteilen.',substitutes:[sub('Sinnenschärfe',10)]},
      {name:'Fallenstellen',aliases:['Fallen stellen'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Wildnisleben',10)]},
      {name:'Fesseln/Entfesseln',aliases:['Fesseln'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','GE','KK'],encumbranceVariants:[{rule:'BE',condition:'Entfesseln; beim Fesseln normalerweise keine eBE.'}],substitutes:[sub('Seefahrt',10),sub('Seiler',10),sub('Akrobatik',5,'Winden','Nur Entfesseln.'),sub('Gaukeleien',10,null,'Nur Entfesseln mit einer vom SL als passend bestimmten Spezialisierung.'),sub('Taschendiebstahl',10,null,'Nur Entfesseln.')]},
      {name:'Fischen/Angeln',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','KK'],encumbranceVariants:[{rule:'BE',condition:'Bestimmte Formen des Angelns; sonst keine pauschale eBE.'}],substitutes:[sub('Wildnisleben',10)]},
      {name:'Orientierung',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','IN'],encumbranceNote:'Keine pauschale eBE; ein Helm mit eingeschränktem Blickfeld kann situativ bis zu +3 verursachen.',substitutes:[sub('Sternkunde',10)]},
      {name:'Wettervorhersage',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','IN'],substitutes:[sub('Wildnisleben',10)]},
      {name:'Wildnisleben',type:TALENT_TYPE.BASIC,defaultAttributes:['IN','GE','KO'],encumbranceNote:'Situativ; beim Erkennen und Einschätzen keine eBE.',substitutes:[sub('Tierkunde',10),sub('Pflanzenkunde',10)]}
    ]),
    ...groupDefinitions(TALENT_GROUP.KNOWLEDGE,[
      {name:'Anatomie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','FF'],substitutes:[sub('Heilkunde Wunden',5),sub('Heilkunde Krankheiten',10)]},
      {name:'Baukunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Zimmermann',10),sub('Maurer',10),sub('Steinmetz',10)]},
      {name:'Brett-/Kartenspiel',aliases:['Brettspiel','Brett/Kartenspiel'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Kriegskunst',10,'Strategie'),sub('Rechnen',10)]},
      {name:'Geographie',aliases:['Geografie'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Sagen/Legenden',10)]},
      {name:'Geschichtswissen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Sagen/Legenden',10)]},
      {name:'Gesteinskunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Steinmetz',5),sub('Bergbau',10),sub('Baukunst',10),sub('Steinschneider/Juwelier',10),sub('Hüttenkunde',10)]},
      {name:'Götter/Kulte',aliases:['Götter und Kulte'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Geschichtswissen',10),sub('Sagen/Legenden',10)]},
      {name:'Heraldik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Etikette',10)]},
      {name:'Hüttenkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','KO'],substitutes:[sub('Alchimie',10),sub('Metallguss',10),sub('Grobschmied',15)]},
      {name:'Kriegskunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','CH'],substitutes:[sub('Brett-/Kartenspiel',10,null,'Strategische Entscheidungen.'),sub('Rechnen',null,null,'Situationsabhängig; WdS nennt keinen festen Zuschlag.'),sub('Menschenkenntnis',null,null,'Situationsabhängig; WdS nennt keinen festen Zuschlag.'),sub('Tierkunde',null,null,'Kampf gegen Monstren; WdS nennt keinen festen Zuschlag.')]},
      {name:'Kryptographie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Rechnen',10),sub('Sprachenkunde',10)]},
      {name:'Magiekunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Sagen/Legenden',10,null,'Insbesondere Dämonologie, Elementarismus und Zauberpraxis.'),sub('Götter/Kulte',10,null,'Sphärologie.')]},
      {name:'Mechanik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Feinmechanik',10)]},
      {name:'Pflanzenkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Wildnisleben',10)]},
      {name:'Philosophie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Götter/Kulte',10),sub('Magiekunde',10),sub('Geschichtswissen',15),sub('Sagen/Legenden',15)]},
      {name:'Rechnen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','KL','IN']},
      {name:'Rechtskunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN'],substitutes:[sub('Etikette',10),sub('Staatskunst',10)]},
      {name:'Sagen/Legenden',aliases:['Sagen und Legenden'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Geschichtswissen',10),sub('Götter/Kulte',10)]},
      {name:'Schätzen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','IN'],substitutes:[sub('Feinmechanik',5,'Goldschmied'),sub('Handel',5),sub('Steinschneider/Juwelier',5)]},
      {name:'Sprachenkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN']},
      {name:'Staatskunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Hauswirtschaft',10),sub('Rechtskunde',10,'Staatsrecht')]},
      {name:'Sternkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','IN']},
      {name:'Tierkunde',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','IN'],substitutes:[sub('Reiten',10),sub('Viehzucht',10),sub('Wildnisleben',10)]}
    ]),
    ...groupDefinitions(TALENT_GROUP.CRAFT,[
      {name:'Abrichten',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','IN','CH'],substitutes:[sub('Reiten',10),sub('Tierkunde',10),sub('Viehzucht',10)]},
      {name:'Ackerbau',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','KO'],substitutes:[sub('Viehzucht',10),sub('Pflanzenkunde',10)]},
      {name:'Alchimie',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','FF'],substitutes:[sub('Kochen',10,'Tränke'),sub('Pflanzenkunde',10)]},
      {name:'Bergbau',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','KO','KK'],substitutes:[sub('Baukunst',10),sub('Gesteinskunde',10),sub('Maurer',10),sub('Steinmetz',10)]},
      {name:'Bogenbau',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Holzbearbeitung',10),sub('Grobschmied',15,null,'Nur Armbrüste.'),sub('Feinmechanik',10,null,'Nur Armbrüste.')]},
      {name:'Boote Fahren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['GE','KO','KK'],substitutes:[sub('Seefahrt',5)]},
      {name:'Brauer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Alchimie',10)]},
      {name:'Drucker',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Mechanik',10),sub('Alchimie',10),sub('Stoffe Färben',10),sub('Metallguss',15)]},
      {name:'Fahrzeug Lenken',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','FF']},
      {name:'Falschspiel',type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','CH','FF'],substitutes:[sub('Gaukeleien',10,'Taschenspielereien')]},
      {name:'Feinmechanik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF']},
      {name:'Feuersteinbearbeitung',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Steinmetz',10)]},
      {name:'Fleischer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Anatomie',10),sub('Fischen/Angeln',10),sub('Kochen',10),sub('Tierkunde',10),sub('Viehzucht',10),sub('Gerber/Kürschner',10,'Trophäen')]},
      {name:'Gerber/Kürschner',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KO'],substitutes:[sub('Alchimie',10),sub('Fleischer',10)]},
      {name:'Glaskunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KO'],substitutes:[sub('Steinschneider/Juwelier',10)]},
      {name:'Grobschmied',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','KO','KK'],substitutes:[sub('Metallguss',15)]},
      {name:'Handel',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','CH'],substitutes:[sub('Hauswirtschaft',10),sub('Geographie',15),sub('Schätzen',15)]},
      {name:'Hauswirtschaft',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','FF'],substitutes:[sub('Rechnen',10,'Buchführung')]},
      {name:'Heilkunde Gift',aliases:['Heilkunde: Gift'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','IN'],substitutes:[sub('Alchimie',5,'Gifte'),sub('Heilkunde Krankheiten',10),sub('Kochen',10,'Tränke')]},
      {name:'Heilkunde Krankheiten',aliases:['Heilkunde Krankheit','Heilkunde: Krankheiten'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['MU','KL','CH'],substitutes:[sub('Heilkunde Gift',10)]},
      {name:'Heilkunde Seele',aliases:['Heilkunde: Seele'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','CH'],substitutes:[sub('Menschenkenntnis',10),sub('Überzeugen',10)]},
      {name:'Heilkunde Wunden',aliases:['Heilkunde: Wunden'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','CH','FF'],substitutes:[sub('Anatomie',10)]},
      {name:'Holzbearbeitung',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Zimmermann',5)]},
      {name:'Instrumentenbauer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Holzbearbeitung',10),sub('Feinmechanik',10)]},
      {name:'Kartographie',aliases:['Kartografie'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF'],substitutes:[sub('Orientierung',10),sub('Sternkunde',10)]},
      {name:'Kochen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Alchimie',10,null,'Nur für die Verwendung Kochen (Tränke).'),sub('Fleischer',10),sub('Fischen/Angeln',10),sub('Wildnisleben',10)]},
      {name:'Kristallzucht',aliases:['Kristallzüchter'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Alchimie',15)]},
      {name:'Lederarbeiten',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Gerber/Kürschner',10),sub('Schneidern',10)]},
      {name:'Malen/Zeichnen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Kartographie',10),sub('Steinmetz',10,'Bildhauer'),sub('Tätowieren',5)]},
      {name:'Maurer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','GE','KK'],substitutes:[sub('Baukunst',10)]},
      {name:'Metallguss',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Hüttenkunde',10),sub('Grobschmied',10)]},
      {name:'Musizieren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','CH','FF']},
      {name:'Schlösser Knacken',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[sub('Feinmechanik',5)]},
      {name:'Schnaps Brennen',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','FF'],substitutes:[sub('Alchimie',5),sub('Brauer',10),sub('Winzer',10)]},
      {name:'Schneidern',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Lederarbeiten',10),sub('Webkunst',10)]},
      {name:'Seefahrt',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','GE','KK'],substitutes:[sub('Boote Fahren',10)]},
      {name:'Seiler',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KK'],substitutes:[sub('Fesseln/Entfesseln',10,'Taue Spleißen')]},
      {name:'Steinmetz',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KK'],substitutes:[sub('Baukunst',10),sub('Bergbau',10),sub('Malen/Zeichnen',10),sub('Maurer',10)]},
      {name:'Steinschneider/Juwelier',aliases:['Steinschneider','Juwelier'],type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[sub('Feinmechanik',10),sub('Kristallzucht',10)]},
      {name:'Stellmacher',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Zimmermann',10)]},
      {name:'Stoffe Färben',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Alchimie',10),sub('Drucker',10,null,'Nur Stoffdruck.')]},
      {name:'Tätowieren',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[sub('Malen/Zeichnen',10)]},
      {name:'Töpfern',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF'],substitutes:[sub('Maurer',10),sub('Steinmetz',10)]},
      {name:'Viehzucht',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','IN','KK'],substitutes:[sub('Tierkunde',10)]},
      {name:'Webkunst',type:TALENT_TYPE.SPECIAL,defaultAttributes:['FF','FF','KK'],substitutes:[sub('Schneidern',10)]},
      {name:'Winzer',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK']},
      {name:'Zimmermann',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','KK'],substitutes:[sub('Holzbearbeitung',10)]}
    ])
  ]);
  // Keep the TALENT-A API and catalog identity for existing callers.
  const CORE_TALENTS=ORDINARY_TALENTS;

  function getTalentDefinition(name,catalog=CORE_TALENTS){
    const wanted=norm(name);
    return list(catalog).find(def=>norm(def.name)===wanted||list(def.aliases).some(alias=>norm(alias)===wanted))||null;
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
