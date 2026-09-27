import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const proficiency=require('../js/dsa41/proficiency-core.js');
const providerApi=require('../js/bridge-heldenmobil-provider.js');
const contract=require('../js/bridge-contract-v1.js');

const {
  PROFICIENCY_KIND,RESOLUTION_MODE,LANGUAGE_OPERATION,SCRIPT_OPERATION,
  LANGUAGE_DEFINITIONS,SCRIPT_DEFINITIONS,PROFICIENCIES
}=proficiency;

const expectedLanguages={
  "Garethi": 18,
  "Bosparano": 21,
  "Aureliani": 21,
  "Zyklopäisch": 18,
  "Tulamidya": 18,
  "Ur-Tulamidya": 21,
  "Zelemja": 18,
  "Alaani": 21,
  "Zhulchammaqra": 15,
  "Ferkina": 16,
  "Ruuz": 18,
  "Altes Kemi": 18,
  "Rabensprache": 15,
  "Thorwalsch": 18,
  "Hjaldingsch": 18,
  "Isdira": 21,
  "Asdharia": 24,
  "Rogolan": 21,
  "Angram": 21,
  "Ologhaijan": 15,
  "Oloarkh": 10,
  "Mahrisch": 20,
  "Rissoal": 20,
  "Drachisch": 21,
  "Goblinisch": 12,
  "Grolmisch": 17,
  "Koboldisch": 15,
  "Molochisch": 17,
  "Neckergesang": 18,
  "Nujuka": 15,
  "Rssahh": 18,
  "Trollisch": 15,
  "Mohisch": 15,
  "Z'Lit": 17,
  "Zhayad": 15,
  "Atak": 12,
  "Füchsisch": 12
};
const expectedScripts={
  "Altes Alaani": 18,
  "Altes Amulashtra": 17,
  "Altes Kemi": 21,
  "Amulashtra": 11,
  "Angram": 21,
  "Arkanil": 24,
  "Asdharia": 18,
  "Chrmk": 18,
  "Chuchas": 24,
  "Drakhard-Zinken": 9,
  "Drakned-Glyphen": 15,
  "Geheiligte Glyphen von Unau": 13,
  "Gimaril": 10,
  "Gjalskisch": 14,
  "Hjaldingsche Runen": 16,
  "Imperiale Zeichen": 12,
  "Isdira": 15,
  "Kusliker Zeichen": 10,
  "Mahrische Glyphen": 15,
  "Nanduria": 10,
  "Rogolan": 11,
  "Trollische Raumbilderschrift": 24,
  "Tulamidya": 14,
  "Ur-Tulamidya": 16,
  "Zhayad": 18
};
assert.equal(LANGUAGE_DEFINITIONS.length,37,'full WdS language inventory');
assert.equal(SCRIPT_DEFINITIONS.length,25,'WdS scripts with paired rows split to HLD-compatible entries');
assert.equal(PROFICIENCIES.length,62);
assert.equal(RESOLUTION_MODE.PROFICIENCY,'PROFICIENCY');
assert.deepEqual(Object.fromEntries(LANGUAGE_DEFINITIONS.map(x=>[x.name,x.complexity])),expectedLanguages);
assert.deepEqual(Object.fromEntries(SCRIPT_DEFINITIONS.map(x=>[x.name,x.complexity])),expectedScripts);

const keys=new Set(),labelsByKind=new Map([[PROFICIENCY_KIND.LANGUAGE,new Set()],[PROFICIENCY_KIND.SCRIPT,new Set()]]);
for(const def of PROFICIENCIES){
  assert.ok(Object.isFrozen(def)&&Object.isFrozen(def.aliases)&&Object.isFrozen(def.complexityVariants),def.key);
  assert.ok(/^(language|script)\.[a-z0-9-]+$/.test(def.key),def.key);
  assert.ok(!keys.has(def.key),`duplicate key ${def.key}`);keys.add(def.key);
  assert.equal(def.resolutionMode,'PROFICIENCY');
  assert.ok(Number.isFinite(def.complexity)&&def.complexity>0);
  const set=labelsByKind.get(def.kind);
  for(const label of [def.name,...def.aliases]){
    const n=proficiency.normalizeLabel(label);
    assert.ok(!set.has(n),`${def.kind}: duplicate name/alias ${label}`);
    set.add(n);
  }
}
assert.equal(proficiency.getProficiencyDefinition('language.garethi').name,'Garethi');
assert.equal(proficiency.getProficiencyDefinition('Sprachen kennen Urtulamidya').key,'language.ur-tulamidya');
assert.equal(proficiency.getProficiencyDefinition('Sprachen kennen Alt-Imperial/Aureliani').key,'language.aureliani');
assert.equal(proficiency.getProficiencyDefinition('Lesen/Schreiben Gimaril-Glyphen').key,'script.gimaril');
assert.equal(proficiency.getProficiencyDefinition('Lesen/Schreiben (Alt-)Imperiale Zeichen').key,'script.imperiale-zeichen');
assert.equal(proficiency.getProficiencyDefinition('Zelemja'),null,'plain ambiguous language/script label must not guess');
assert.deepEqual(proficiency.definitionsForHldTalent({name:'Lesen/Schreiben Isdira/Asdharia'}).map(x=>x.key),['script.isdira','script.asdharia']);

const garethi=proficiency.getProficiencyDefinition('language.garethi');
assert.equal(proficiency.requiredBaseValue(garethi,LANGUAGE_OPERATION.IDENTIFY),1);
assert.equal(proficiency.requiredBaseValue(garethi,LANGUAGE_OPERATION.BASIC_COMMUNICATION),2);
assert.equal(proficiency.requiredBaseValue(garethi,LANGUAGE_OPERATION.SIMPLE_SENTENCES),4);
assert.equal(proficiency.requiredBaseValue(garethi,LANGUAGE_OPERATION.COMMON_GRAMMAR),6);
assert.equal(proficiency.requiredBaseValue(garethi,LANGUAGE_OPERATION.NATIVE_LIKE),9);
let resolved=proficiency.resolveProficiency({definition:garethi,value:7,operation:'COMMON_GRAMMAR',modifier:2});
assert.deepEqual([resolved.success,resolved.effectiveValue,resolved.baseRequiredValue,resolved.requiredValue,resolved.externalModifier],[false,7,6,8,2]);
resolved=proficiency.resolveProficiency({definition:garethi,value:7,operation:'COMMON_GRAMMAR',modifier:-1});
assert.deepEqual([resolved.success,resolved.effectiveValue,resolved.requiredValue],[true,7,5]);

const kuslik=proficiency.getProficiencyDefinition('script.kusliker-zeichen');
assert.equal(proficiency.requiredBaseValue(kuslik,SCRIPT_OPERATION.LETTER_RECOGNITION),1);
assert.equal(proficiency.requiredBaseValue(kuslik,SCRIPT_OPERATION.SHORT_TEXT),4);
assert.equal(proficiency.requiredBaseValue(kuslik,SCRIPT_OPERATION.EVERYDAY_TEXT),5);
assert.equal(proficiency.requiredBaseValue(kuslik,SCRIPT_OPERATION.FULL_SCRIPT_MASTERY),10);
assert.equal(proficiency.getProficiencyDefinition('script.amulashtra').complexity,11);
assert.equal(proficiency.getProficiencyDefinition('script.altes-amulashtra').complexity,17);
assert.throws(()=>proficiency.resolveProficiency({definition:garethi,value:8,operation:'ROLL_3W20'}),e=>e.code==='proficiency-operation-invalid');

const props=Object.entries(providerApi.SHORT_TO_FULL).map(([short,name])=>({name,value:12,mod:0}));
const hero={
  key:'e2-hero',name:'E2 Testheld',props,
  talents:[
    {name:'Kochen',probe:' (KL/IN/FF)',value:8,be:'-',specs:[]},
    {name:'Sprachen kennen Garethi',probe:' (KL/IN/CH)',value:7,k:'18',be:'-',specs:[]},
    {name:'Lesen/Schreiben Kusliker Zeichen',probe:' (KL/KL/FF)',value:5,k:'10',be:'-',specs:[]},
    {name:'Lesen/Schreiben Isdira/Asdharia',probe:' (KL/KL/FF)',value:8,k:'18',be:'-',specs:[]},
    {name:'Sprachen kennen Wudu',probe:' (KL/IN/CH)',value:9,k:'15',be:'-',specs:[]}
  ],
  spells:[],liturgyKnowledges:[],combat:[]
};
let diceUsed=0;
const provider=providerApi.createProvider({getHeroes:()=>[hero],getCombatState:()=>({be:0}),rollDie:()=>{diceUsed++;return 8;}});
const snapshot=provider.getHeroSnapshot(hero.key);
const byKey=new Map(snapshot.talents.map(x=>[x.key,x]));
assert.deepEqual(byKey.get('language.garethi'),{key:'language.garethi',name:'Garethi',value:7,attributes:[],complexity:18});
assert.deepEqual(byKey.get('script.kusliker-zeichen'),{key:'script.kusliker-zeichen',name:'Kusliker Zeichen',value:5,attributes:[],complexity:10});
assert.equal(byKey.get('script.isdira').value,8);
assert.equal(byKey.get('script.asdharia').complexity,18);
assert.equal(byKey.get('talent.kochen').attributes.length,3,'ordinary E1 snapshot now uses its stable talent.* key');
assert.ok(!snapshot.talents.some(x=>x.key==='Sprachen kennen Garethi'),'raw proficiency must not remain a generic talent snapshot');
assert.ok(!snapshot.talents.some(x=>/Wudu/.test(x.key)||/Wudu/.test(x.name)),'out-of-WdS proficiency is not projected as a generic 3W20 talent');

const request=(key,{operation=null,modifier=0,mode='standard'}={})=>contract.checkRequestV1({
  requestId:'e2-check',heroId:hero.key,check:{kind:'talent',key,mode},modifier,
  context:{talent:{ruleProfile:'dsa41-v1'},...(operation?{proficiency:{operation}}:{})}
});
let before=diceUsed;
let result=provider.executeCheck(request('language.garethi',{operation:'SIMPLE_SENTENCES'}));
assert.deepEqual([result.status,result.success,result.outcome,result.effectiveValue,result.qualityPoints,result.rolls.length,result.meta.requiredValue],['resolved',true,'proficiency-sufficient',7,null,0,4]);
assert.equal(diceUsed,before,'proficiency resolution never rolls');

result=provider.executeCheck(request('language.garethi',{operation:'COMMON_GRAMMAR',modifier:2}));
assert.deepEqual([result.success,result.effectiveValue,result.meta.baseRequiredValue,result.meta.requiredValue,result.meta.externalModifier],[false,7,6,8,2]);
assert.equal(diceUsed,before);
result=provider.executeCheck(request('language.garethi',{operation:'COMMON_GRAMMAR',modifier:-1}));
assert.deepEqual([result.success,result.effectiveValue,result.meta.requiredValue],[true,7,5]);
assert.equal(diceUsed,before);

result=provider.executeCheck(request('script.kusliker-zeichen',{operation:'EVERYDAY_TEXT'}));
assert.deepEqual([result.status,result.success,result.effectiveValue,result.meta.requiredValue],[ 'resolved',true,5,5]);
assert.equal(diceUsed,before);
result=provider.executeCheck(request('Sprachen kennen Garethi',{operation:'IDENTIFY'}));
assert.equal(result.status,'resolved','exact HLD label routes through PROFICIENCY');
assert.equal(diceUsed,before);

result=provider.executeCheck(request('language.garethi'));
assert.deepEqual([result.status,result.outcome,result.rolls.length],['unsupported','proficiency-operation-required',0]);
assert.equal(diceUsed,before);
result=provider.executeCheck(request('language.bosparano',{operation:'IDENTIFY'}));
assert.deepEqual([result.status,result.outcome],['unsupported','proficiency-unavailable']);
assert.equal(diceUsed,before);
result=provider.executeCheck(request('language.unknown',{operation:'IDENTIFY'}));
assert.deepEqual([result.status,result.outcome],['unsupported','proficiency-definition-unavailable']);
assert.equal(diceUsed,before);
result=provider.executeCheck(request('language.garethi',{operation:'IDENTIFY',mode:'EXTENDED'}));
assert.deepEqual([result.status,result.outcome,result.rolls.length],['unsupported','talent-check-mode-unsupported',0]);
assert.equal(diceUsed,before);

result=provider.executeCheck(request('Kochen'));
assert.deepEqual([result.status,result.success,result.meta.resolutionMode],[ 'resolved',true,undefined]);
assert.equal(diceUsed,before+3,'ordinary E1 talent still uses exactly three d20');
before=diceUsed;

const contractSnapshot=contract.heroSnapshotV1({
  heroId:'c',name:'Contract',attributes:{},energies:{},
  talents:[{key:'language.garethi',name:'Garethi',value:7,attributes:[],complexity:18}],
  spells:[],combat:{},capabilities:[],display:{},source:{}
});
assert.equal(contractSnapshot.talents[0].complexity,18,'non-spell abilities preserve complexity');

const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
assert.ok(app.includes("function isProficiencyTalentRow(t){return t?.category==='Sprachen'||t?.category==='Schriften';}"));
assert.ok(app.includes('proficiency-row')&&app.includes('keine normale 3W20-Probe'),'UI marks proficiency rows as non-rollable');

const browser=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../js/dsa41/proficiency-core.js',import.meta.url),'utf8'),browser,{filename:'proficiency-core.js'});
assert.equal(browser.HeldenMobilDsa41Proficiency.PROFICIENCIES.length,62);
assert.equal(browser.HeldenMobilDsa41Proficiency.getProficiencyDefinition('language.garethi').complexity,18);

console.log('TALENT-E2 passed: 37 languages / 25 scripts; PROFICIENCY routing, snapshot and no-dice regressions');
