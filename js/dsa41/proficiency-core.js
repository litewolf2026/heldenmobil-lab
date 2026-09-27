(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Proficiency=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const PROFICIENCY_KIND=Object.freeze({LANGUAGE:'LANGUAGE',SCRIPT:'SCRIPT'});
  const RESOLUTION_MODE=Object.freeze({PROFICIENCY:'PROFICIENCY'});
  const LANGUAGE_OPERATION=Object.freeze({
    IDENTIFY:'IDENTIFY',
    BASIC_COMMUNICATION:'BASIC_COMMUNICATION',
    SIMPLE_SENTENCES:'SIMPLE_SENTENCES',
    COMMON_GRAMMAR:'COMMON_GRAMMAR',
    NATIVE_LIKE:'NATIVE_LIKE'
  });
  const SCRIPT_OPERATION=Object.freeze({
    LETTER_RECOGNITION:'LETTER_RECOGNITION',
    SHORT_TEXT:'SHORT_TEXT',
    EVERYDAY_TEXT:'EVERYDAY_TEXT',
    FULL_SCRIPT_MASTERY:'FULL_SCRIPT_MASTERY'
  });

  const RAW_LANGUAGES=[
  {
    "key": "language.garethi",
    "name": "Garethi",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "language.bosparano",
    "name": "Bosparano",
    "aliases": [],
    "complexity": 21
  },
  {
    "key": "language.aureliani",
    "name": "Aureliani",
    "aliases": [
      "Altgüldenländisch",
      "Alt-Imperial/Aureliani"
    ],
    "complexity": 21
  },
  {
    "key": "language.zyklopaeisch",
    "name": "Zyklopäisch",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "language.tulamidya",
    "name": "Tulamidya",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "language.ur-tulamidya",
    "name": "Ur-Tulamidya",
    "aliases": [
      "Urtulamidya"
    ],
    "complexity": 21
  },
  {
    "key": "language.zelemja",
    "name": "Zelemja",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "language.alaani",
    "name": "Alaani",
    "aliases": [
      "Norbardisch"
    ],
    "complexity": 21
  },
  {
    "key": "language.zhulchammaqra",
    "name": "Zhulchammaqra",
    "aliases": [
      "Trollzackisch"
    ],
    "complexity": 15
  },
  {
    "key": "language.ferkina",
    "name": "Ferkina",
    "aliases": [],
    "complexity": 16
  },
  {
    "key": "language.ruuz",
    "name": "Ruuz",
    "aliases": [
      "Ur-Maraskanisch"
    ],
    "complexity": 18
  },
  {
    "key": "language.altes-kemi",
    "name": "Altes Kemi",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "language.rabensprache",
    "name": "Rabensprache",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "language.thorwalsch",
    "name": "Thorwalsch",
    "aliases": [
      "Gjalskisch",
      "Fjarningisch"
    ],
    "complexity": 18
  },
  {
    "key": "language.hjaldingsch",
    "name": "Hjaldingsch",
    "aliases": [
      "Saga-Thorwalsch"
    ],
    "complexity": 18
  },
  {
    "key": "language.isdira",
    "name": "Isdira",
    "aliases": [],
    "complexity": 21
  },
  {
    "key": "language.asdharia",
    "name": "Asdharia",
    "aliases": [],
    "complexity": 24
  },
  {
    "key": "language.rogolan",
    "name": "Rogolan",
    "aliases": [],
    "complexity": 21
  },
  {
    "key": "language.angram",
    "name": "Angram",
    "aliases": [],
    "complexity": 21
  },
  {
    "key": "language.ologhaijan",
    "name": "Ologhaijan",
    "aliases": [
      "Hochorkisch"
    ],
    "complexity": 15
  },
  {
    "key": "language.oloarkh",
    "name": "Oloarkh",
    "aliases": [],
    "complexity": 10
  },
  {
    "key": "language.mahrisch",
    "name": "Mahrisch",
    "aliases": [],
    "complexity": 20
  },
  {
    "key": "language.rissoal",
    "name": "Rissoal",
    "aliases": [],
    "complexity": 20
  },
  {
    "key": "language.drachisch",
    "name": "Drachisch",
    "aliases": [],
    "complexity": 21
  },
  {
    "key": "language.goblinisch",
    "name": "Goblinisch",
    "aliases": [],
    "complexity": 12
  },
  {
    "key": "language.grolmisch",
    "name": "Grolmisch",
    "aliases": [],
    "complexity": 17
  },
  {
    "key": "language.koboldisch",
    "name": "Koboldisch",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "language.molochisch",
    "name": "Molochisch",
    "aliases": [],
    "complexity": 17
  },
  {
    "key": "language.neckergesang",
    "name": "Neckergesang",
    "aliases": [],
    "complexity": 18,
    "complexityVariants": [
      24
    ],
    "complexityNote": "Mit GEDANKENBILDERN nennt WdS eine Komplexität bis 24."
  },
  {
    "key": "language.nujuka",
    "name": "Nujuka",
    "aliases": [
      "Nivesisch"
    ],
    "complexity": 15
  },
  {
    "key": "language.rssahh",
    "name": "Rssahh",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "language.trollisch",
    "name": "Trollisch",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "language.mohisch",
    "name": "Mohisch",
    "aliases": [
      "Waldmenschen-Sprachen"
    ],
    "complexity": 15
  },
  {
    "key": "language.zlit",
    "name": "Z'Lit",
    "aliases": [
      "ZLit"
    ],
    "complexity": 17
  },
  {
    "key": "language.zhayad",
    "name": "Zhayad",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "language.atak",
    "name": "Atak",
    "aliases": [],
    "complexity": 12
  },
  {
    "key": "language.fuechsisch",
    "name": "Füchsisch",
    "aliases": [],
    "complexity": 12
  }
];
  const RAW_SCRIPTS=[
  {
    "key": "script.altes-alaani",
    "name": "Altes Alaani",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "script.altes-amulashtra",
    "name": "Altes Amulashtra",
    "aliases": [
      "Alt-Amulashtra"
    ],
    "complexity": 17,
    "complexityNote": "Historische Amulashtra-Form; WdS führt Amulashtra modern/historisch mit 11/17."
  },
  {
    "key": "script.altes-kemi",
    "name": "Altes Kemi",
    "aliases": [],
    "complexity": 21
  },
  {
    "key": "script.amulashtra",
    "name": "Amulashtra",
    "aliases": [],
    "complexity": 11,
    "complexityNote": "Moderne Amulashtra-Form; WdS führt Amulashtra modern/historisch mit 11/17."
  },
  {
    "key": "script.angram",
    "name": "Angram",
    "aliases": [
      "Angram-Glyphen"
    ],
    "complexity": 21
  },
  {
    "key": "script.arkanil",
    "name": "Arkanil",
    "aliases": [
      "Rohalsschrift"
    ],
    "complexity": 24
  },
  {
    "key": "script.asdharia",
    "name": "Asdharia",
    "aliases": [],
    "complexity": 18
  },
  {
    "key": "script.chrmk",
    "name": "Chrmk",
    "aliases": [
      "Zelemja"
    ],
    "complexity": 18
  },
  {
    "key": "script.chuchas",
    "name": "Chuchas",
    "aliases": [
      "Yash-Hualay-Glyphen",
      "Protozelemja"
    ],
    "complexity": 24
  },
  {
    "key": "script.drakhard-zinken",
    "name": "Drakhard-Zinken",
    "aliases": [
      "Zauberrunen"
    ],
    "complexity": 9,
    "complexityNote": "WdS notiert die Komplexität als 9(+); E2 verwendet den HLD-kompatiblen Basiswert 9."
  },
  {
    "key": "script.drakned-glyphen",
    "name": "Drakned-Glyphen",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "script.geheiligte-glyphen-von-unau",
    "name": "Geheiligte Glyphen von Unau",
    "aliases": [],
    "complexity": 13
  },
  {
    "key": "script.gimaril",
    "name": "Gimaril",
    "aliases": [
      "Gimaril-Glyphen"
    ],
    "complexity": 10
  },
  {
    "key": "script.gjalskisch",
    "name": "Gjalskisch",
    "aliases": [],
    "complexity": 14
  },
  {
    "key": "script.hjaldingsche-runen",
    "name": "Hjaldingsche Runen",
    "aliases": [
      "Hjaldingsche Runenzeichen"
    ],
    "complexity": 16,
    "complexityVariants": [
      10
    ],
    "complexityNote": "WdS führt 10/16; die HLD verwendet für das Talent den Gesamtwert 16."
  },
  {
    "key": "script.imperiale-zeichen",
    "name": "Imperiale Zeichen",
    "aliases": [
      "(Alt-)Imperiale Zeichen",
      "Alt-Imperiale Zeichen",
      "Altgüldenländisch"
    ],
    "complexity": 12
  },
  {
    "key": "script.isdira",
    "name": "Isdira",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "script.kusliker-zeichen",
    "name": "Kusliker Zeichen",
    "aliases": [],
    "complexity": 10
  },
  {
    "key": "script.mahrische-glyphen",
    "name": "Mahrische Glyphen",
    "aliases": [],
    "complexity": 15
  },
  {
    "key": "script.nanduria",
    "name": "Nanduria",
    "aliases": [],
    "complexity": 10
  },
  {
    "key": "script.rogolan",
    "name": "Rogolan",
    "aliases": [
      "Rogolan-Runen"
    ],
    "complexity": 11
  },
  {
    "key": "script.trollische-raumbilderschrift",
    "name": "Trollische Raumbilderschrift",
    "aliases": [
      "Raumbilder"
    ],
    "complexity": 24
  },
  {
    "key": "script.tulamidya",
    "name": "Tulamidya",
    "aliases": [],
    "complexity": 14
  },
  {
    "key": "script.ur-tulamidya",
    "name": "Ur-Tulamidya",
    "aliases": [
      "Urtulamidya"
    ],
    "complexity": 16
  },
  {
    "key": "script.zhayad",
    "name": "Zhayad",
    "aliases": [],
    "complexity": 18
  }
];

  function normalizeLabel(value){
    return String(value??'').normalize('NFC').trim().toLocaleLowerCase('de-DE')
      .replace(/[‘’]/g,"'").replace(/\s*\/\s*/g,'/').replace(/\s+/g,' ');
  }
  function freezeDefinition(def,kind){
    return Object.freeze({
      key:String(def.key),name:String(def.name),
      aliases:Object.freeze([...(def.aliases||[])]),
      kind,resolutionMode:RESOLUTION_MODE.PROFICIENCY,
      complexity:Number(def.complexity),
      complexityVariants:Object.freeze([...(def.complexityVariants||[])]),
      ...(def.complexityNote?{complexityNote:String(def.complexityNote)}:{})
    });
  }

  const LANGUAGE_DEFINITIONS=Object.freeze(RAW_LANGUAGES.map(def=>freezeDefinition(def,PROFICIENCY_KIND.LANGUAGE)));
  const SCRIPT_DEFINITIONS=Object.freeze(RAW_SCRIPTS.map(def=>freezeDefinition(def,PROFICIENCY_KIND.SCRIPT)));
  const PROFICIENCIES=Object.freeze([...LANGUAGE_DEFINITIONS,...SCRIPT_DEFINITIONS]);
  const BY_KEY=new Map(PROFICIENCIES.map(def=>[def.key,def]));
  const LABELS=new Map();
  for(const def of PROFICIENCIES){
    if(!Number.isFinite(def.complexity)||def.complexity<=0)throw new Error(`${def.key}: invalid complexity`);
    for(const label of [def.name,...def.aliases]){
      const k=`${def.kind}:${normalizeLabel(label)}`;
      if(LABELS.has(k))throw new Error(`duplicate proficiency label in ${def.kind}: ${label}`);
      LABELS.set(k,def);
    }
  }

  function unwrapOuterParens(value){
    const s=String(value??'').trim();
    return s.startsWith('(')&&s.endsWith(')')?s.slice(1,-1).trim():s;
  }
  function parseHldName(value){
    const raw=String(value??'').trim();
    let m=/^sprachen\s+kennen\s+(.+)$/i.exec(raw);
    if(m)return {kind:PROFICIENCY_KIND.LANGUAGE,label:unwrapOuterParens(m[1])};
    m=/^lesen\/schreiben\s+(.+)$/i.exec(raw);
    if(m)return {kind:PROFICIENCY_KIND.SCRIPT,label:unwrapOuterParens(m[1])};
    return null;
  }
  function getByLabel(value,kind){return LABELS.get(`${kind}:${normalizeLabel(value)}`)||null;}
  function getProficiencyDefinition(value,kind=null){
    const raw=String(value??'').trim();
    if(!raw)return null;
    const keyed=BY_KEY.get(raw.toLocaleLowerCase('de-DE'));
    if(keyed)return !kind||keyed.kind===kind?keyed:null;
    const parsed=parseHldName(raw);
    if(parsed)return getByLabel(parsed.label,parsed.kind);
    if(kind)return getByLabel(raw,kind);
    const matches=[PROFICIENCY_KIND.LANGUAGE,PROFICIENCY_KIND.SCRIPT].map(k=>getByLabel(raw,k)).filter(Boolean);
    return matches.length===1?matches[0]:null;
  }
  function isProficiencyKey(value){return /^(?:language|script)\./i.test(String(value??'').trim());}
  function isHldProficiencyName(value){return !!parseHldName(value);}
  function definitionsForHldTalent(talent){
    const parsed=parseHldName(talent?.name);
    if(!parsed)return [];
    if(parsed.kind===PROFICIENCY_KIND.SCRIPT&&normalizeLabel(parsed.label)==='isdira/asdharia'){
      return [BY_KEY.get('script.isdira'),BY_KEY.get('script.asdharia')];
    }
    const def=getByLabel(parsed.label,parsed.kind);
    return def?[def]:[];
  }
  function findHeroProficiency({definition,heroTalents=[]}={}){
    if(!definition)return null;
    for(const talent of Array.isArray(heroTalents)?heroTalents:[]){
      if(definitionsForHldTalent(talent).some(def=>def.key===definition.key))return talent;
    }
    return null;
  }
  function requiredBaseValue(definition,operation){
    const op=String(operation??'').trim().toUpperCase();
    if(definition.kind===PROFICIENCY_KIND.LANGUAGE){
      if(op===LANGUAGE_OPERATION.IDENTIFY)return 1;
      if(op===LANGUAGE_OPERATION.BASIC_COMMUNICATION)return 2;
      if(op===LANGUAGE_OPERATION.SIMPLE_SENTENCES)return 4;
      if(op===LANGUAGE_OPERATION.COMMON_GRAMMAR)return Math.ceil(definition.complexity/3);
      if(op===LANGUAGE_OPERATION.NATIVE_LIKE)return Math.ceil(definition.complexity/2);
    }else if(definition.kind===PROFICIENCY_KIND.SCRIPT){
      if(op===SCRIPT_OPERATION.LETTER_RECOGNITION)return 1;
      if(op===SCRIPT_OPERATION.SHORT_TEXT)return Math.ceil(definition.complexity/3);
      if(op===SCRIPT_OPERATION.EVERYDAY_TEXT)return Math.ceil(definition.complexity/2);
      if(op===SCRIPT_OPERATION.FULL_SCRIPT_MASTERY)return definition.complexity;
    }
    const error=new RangeError(`unsupported proficiency operation ${operation}`);
    error.code='proficiency-operation-invalid';
    throw error;
  }
  function resolveProficiency({definition,value,operation,modifier=0}={}){
    if(!definition||definition.resolutionMode!==RESOLUTION_MODE.PROFICIENCY){
      const error=new RangeError('proficiency definition required');
      error.code='proficiency-definition-invalid';
      throw error;
    }
    const actual=Number(value),externalModifier=Number(modifier);
    if(!Number.isFinite(actual)){const error=new TypeError('proficiency value must be finite');error.code='proficiency-value-invalid';throw error;}
    if(!Number.isFinite(externalModifier)){const error=new TypeError('proficiency modifier must be finite');error.code='proficiency-modifier-invalid';throw error;}
    const normalizedOperation=String(operation??'').trim().toUpperCase();
    if(!normalizedOperation){const error=new RangeError('proficiency operation required');error.code='proficiency-operation-required';throw error;}
    const baseRequiredValue=requiredBaseValue(definition,normalizedOperation),requiredValue=baseRequiredValue+externalModifier;
    const success=actual>=requiredValue;
    return Object.freeze({
      success,outcome:success?'proficiency-sufficient':'proficiency-insufficient',
      value:actual,effectiveValue:actual,operation:normalizedOperation,
      baseRequiredValue,requiredValue,externalModifier,
      definition
    });
  }
  function snapshotAbilities(heroTalents=[]){
    const out=new Map();
    for(const talent of Array.isArray(heroTalents)?heroTalents:[]){
      for(const def of definitionsForHldTalent(talent)){
        const value=Number(talent?.value);
        if(!Number.isFinite(value)||out.has(def.key))continue;
        out.set(def.key,{key:def.key,name:def.name,value,attributes:[],complexity:def.complexity});
      }
    }
    return [...out.values()];
  }

  return {
    PROFICIENCY_KIND,RESOLUTION_MODE,LANGUAGE_OPERATION,SCRIPT_OPERATION,
    LANGUAGE_DEFINITIONS,SCRIPT_DEFINITIONS,PROFICIENCIES,
    normalizeLabel,parseHldName,getProficiencyDefinition,isProficiencyKey,isHldProficiencyName,
    definitionsForHldTalent,findHeroProficiency,requiredBaseValue,resolveProficiency,snapshotAbilities
  };
});
