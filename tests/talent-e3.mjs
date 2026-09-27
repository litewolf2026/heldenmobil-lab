import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const registry=require('../js/dsa41/combat-talent-registry.js');
const providerApi=require('../js/bridge-heldenmobil-provider.js');
const contract=require('../js/bridge-contract-v1.js');
const {COMBAT_CLASS,TALENT_TYPE,RESOLUTION_MODE,COMBAT_TALENTS}=registry;
const expected={
  "Anderthalbhänder": {
    "key": "combat.anderthalbhaender",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.schwerter",
      "combat.zweihandschwerter-saebel"
    ],
    "specializationAllowed": true
  },
  "Armbrust": {
    "key": "combat.armbrust",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "C",
    "encumbranceRule": "BE-5",
    "substitutes": [
      "combat.bogen"
    ],
    "specializationAllowed": true
  },
  "Belagerungswaffen": {
    "key": "combat.belagerungswaffen",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": null,
    "substitutes": [],
    "specializationAllowed": true
  },
  "Blasrohr": {
    "key": "combat.blasrohr",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-5",
    "substitutes": [],
    "specializationAllowed": false
  },
  "Bogen": {
    "key": "combat.bogen",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-3",
    "substitutes": [],
    "specializationAllowed": true
  },
  "Diskus": {
    "key": "combat.diskus",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-2",
    "substitutes": [],
    "specializationAllowed": false
  },
  "Dolche": {
    "key": "combat.dolche",
    "combatClass": "ARMED_MELEE",
    "type": "BASIC",
    "advancementColumn": "D",
    "encumbranceRule": "BE-1",
    "substitutes": [
      "combat.fechtwaffen",
      "combat.raufen"
    ],
    "specializationAllowed": true
  },
  "Fechtwaffen": {
    "key": "combat.fechtwaffen",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-1",
    "substitutes": [
      "combat.dolche",
      "combat.schwerter"
    ],
    "specializationAllowed": true
  },
  "Hiebwaffen": {
    "key": "combat.hiebwaffen",
    "combatClass": "ARMED_MELEE",
    "type": "BASIC",
    "advancementColumn": "D",
    "encumbranceRule": "BE-4",
    "substitutes": [
      "combat.saebel"
    ],
    "specializationAllowed": true
  },
  "Infanteriewaffen": {
    "key": "combat.infanteriewaffen",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.speere",
      "combat.zweihand-hiebwaffen"
    ],
    "specializationAllowed": true
  },
  "Kettenstäbe": {
    "key": "combat.kettenstaebe",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-1",
    "substitutes": [
      "combat.kettenwaffen",
      "combat.zweihandflegel"
    ],
    "specializationAllowed": false
  },
  "Kettenwaffen": {
    "key": "combat.kettenwaffen",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.kettenstaebe",
      "combat.zweihandflegel"
    ],
    "specializationAllowed": true
  },
  "Lanzenreiten": {
    "key": "combat.lanzenreiten",
    "combatClass": "ATTACK_ONLY",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": null,
    "substitutes": [],
    "specializationAllowed": false
  },
  "Peitsche": {
    "key": "combat.peitsche",
    "combatClass": "ATTACK_ONLY",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-1",
    "substitutes": [],
    "specializationAllowed": false
  },
  "Raufen": {
    "key": "combat.raufen",
    "combatClass": "UNARMED",
    "type": "BASIC",
    "advancementColumn": "C",
    "encumbranceRule": "BE",
    "substitutes": [],
    "specializationAllowed": false
  },
  "Ringen": {
    "key": "combat.ringen",
    "combatClass": "UNARMED",
    "type": "BASIC",
    "advancementColumn": "D",
    "encumbranceRule": "BE",
    "substitutes": [],
    "specializationAllowed": false
  },
  "Säbel": {
    "key": "combat.saebel",
    "combatClass": "ARMED_MELEE",
    "type": "BASIC",
    "advancementColumn": "D",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.hiebwaffen",
      "combat.schwerter"
    ],
    "specializationAllowed": true
  },
  "Schleuder": {
    "key": "combat.schleuder",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-2",
    "substitutes": [],
    "specializationAllowed": true
  },
  "Schwerter": {
    "key": "combat.schwerter",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.anderthalbhaender",
      "combat.fechtwaffen",
      "combat.saebel"
    ],
    "specializationAllowed": true
  },
  "Speere": {
    "key": "combat.speere",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.infanteriewaffen"
    ],
    "specializationAllowed": true
  },
  "Stäbe": {
    "key": "combat.staebe",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.speere"
    ],
    "specializationAllowed": true
  },
  "Wurfbeile": {
    "key": "combat.wurfbeile",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.wurfspeere",
      "combat.wurfmesser"
    ],
    "specializationAllowed": true
  },
  "Wurfmesser": {
    "key": "combat.wurfmesser",
    "combatClass": "RANGED",
    "type": "BASIC",
    "advancementColumn": "C",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.wurfbeile",
      "combat.wurfspeere"
    ],
    "specializationAllowed": true
  },
  "Wurfspeere": {
    "key": "combat.wurfspeere",
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "C",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.wurfbeile"
    ],
    "specializationAllowed": true
  },
  "Zweihandflegel": {
    "key": "combat.zweihandflegel",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.infanteriewaffen",
      "combat.kettenwaffen"
    ],
    "specializationAllowed": false
  },
  "Zweihand-Hiebwaffen": {
    "key": "combat.zweihand-hiebwaffen",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.hiebwaffen",
      "combat.infanteriewaffen"
    ],
    "specializationAllowed": true
  },
  "Zweihandschwerter/-säbel": {
    "key": "combat.zweihandschwerter-saebel",
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.anderthalbhaender",
      "combat.schwerter",
      "combat.saebel"
    ],
    "specializationAllowed": true
  }
};

assert.equal(COMBAT_TALENTS.length,27);
assert.equal(COMBAT_TALENTS.filter(x=>x.type===TALENT_TYPE.BASIC).length,6);
assert.equal(COMBAT_TALENTS.filter(x=>x.type===TALENT_TYPE.SPECIAL).length,21);
assert.deepEqual(Object.keys(COMBAT_CLASS).sort(),['ARMED_MELEE','ATTACK_ONLY','RANGED','UNARMED'].sort());
assert.equal(RESOLUTION_MODE.COMBAT,'COMBAT');

const keys=new Set(),labels=new Set();
for(const def of COMBAT_TALENTS){
  assert.ok(Object.isFrozen(def)&&Object.isFrozen(def.aliases)&&Object.isFrozen(def.substitutes),def.key);
  assert.ok(/^combat\.[a-z0-9-]+$/.test(def.key),def.key);assert.ok(!keys.has(def.key),def.key);keys.add(def.key);
  assert.equal(def.resolutionMode,'COMBAT');
  for(const label of [def.name,...def.aliases]){const n=registry.norm(label);assert.ok(!labels.has(n),label);labels.add(n);}
}
for(const def of COMBAT_TALENTS)for(const substitute of def.substitutes)assert.ok(keys.has(substitute),`${def.key}: ${substitute}`);
for(const [name,meta] of Object.entries(expected)){const d=registry.getCombatTalentDefinition(name);assert.deepEqual({
  key:d.key,combatClass:d.combatClass,type:d.type,advancementColumn:d.advancementColumn,encumbranceRule:d.encumbranceRule,
  substitutes:[...d.substitutes],specializationAllowed:d.specializationAllowed
},meta,name);}
assert.equal(registry.getCombatTalentDefinition('combat.schwerter').name,'Schwerter');
assert.equal(registry.getCombatTalentDefinition('Zweihandhiebwaffen').key,'combat.zweihand-hiebwaffen');
assert.equal(registry.getCombatTalentDefinition('zweihand hiebwaffen'),null,'no fuzzy matching');

for(const [name,rule,penalty] of [
  ['Belagerungswaffen',null,0],['Lanzenreiten',null,0],['Wurfbeile','BE-2',4],['Blasrohr','BE-5',1],
  ['Kettenstäbe','BE-1',5],['Peitsche','BE-1',5],['Zweihandflegel','BE-3',3],['Zweihand-Hiebwaffen','BE-3',3],
  ['Raufen','BE',6],['Hiebwaffen','BE-4',2]
]){const d=registry.getCombatTalentDefinition(name);assert.equal(d.encumbranceRule,rule,name);assert.equal(registry.encumbrancePenalty(name,6),penalty,name);}
assert.equal(registry.encumbrancePenalty('Bastardstäbe',6),null);
assert.deepEqual(COMBAT_TALENTS.filter(x=>!x.specializationAllowed).map(x=>x.name),['Blasrohr','Diskus','Kettenstäbe','Lanzenreiten','Peitsche','Raufen','Ringen','Zweihandflegel']);

const props=Object.entries(providerApi.SHORT_TO_FULL).map(([short,name])=>({name,value:12,mod:0}));
const hero={key:'e3-hero',name:'E3 Testheld',props,talents:[],spells:[],liturgyKnowledges:[],combat:[
  {name:'Schwerter',at:14,pa:12},{name:'Zweihandhiebwaffen',at:13,pa:11},{name:'Bastardstäbe',at:12,pa:10}
]};
let diceUsed=0;const provider=providerApi.createProvider({getHeroes:()=>[hero],rollDie:()=>{diceUsed++;return 8;}});
const snapshot=provider.getHeroSnapshot(hero.key),rows=snapshot.combat.combatTalents;
assert.equal(rows.length,3);
assert.deepEqual([rows[0].name,rows[0].at,rows[0].pa,rows[0].key,rows[0].canonicalName,rows[0].resolutionMode,rows[0].combatClass,rows[0].encumbranceRule],
['Schwerter',14,12,'combat.schwerter','Schwerter','COMBAT','ARMED_MELEE','BE-2']);
assert.equal(rows[1].key,'combat.zweihand-hiebwaffen');assert.equal(rows[1].canonicalName,'Zweihand-Hiebwaffen');
assert.deepEqual(rows[2],{name:'Bastardstäbe',at:12,pa:10});

const request=(key,profile=true)=>contract.checkRequestV1({requestId:'e3-check',heroId:hero.key,check:{kind:'talent',key,mode:'standard'},context:profile?{talent:{ruleProfile:'dsa41-v1'}}:{}});
const before=diceUsed;
let result=provider.executeCheck(request('combat.schwerter'));
assert.deepEqual([result.status,result.outcome,result.meta.resolutionMode,result.meta.combatKey,result.rolls.length],['unsupported','combat-resolution-required','COMBAT','combat.schwerter',0]);
assert.equal(diceUsed,before);
result=provider.executeCheck(request('combat.schwerter',false));assert.equal(result.outcome,'combat-resolution-required');assert.equal(diceUsed,before);
result=provider.executeCheck(request('combat.unknown'));assert.deepEqual([result.status,result.outcome,result.meta.resolutionMode],['unsupported','combat-definition-unavailable','COMBAT']);assert.equal(diceUsed,before);

const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
assert.ok(app.includes('HeldenMobilDsa41CombatTalents.encumbrancePenalty'));
assert.ok(app.includes('const COMBAT_UI_META'));assert.ok(!app.includes('const COMBAT_META'));
assert.ok(!/COMBAT_UI_META\s*=\s*\{[\s\S]{0,2500}\bebe\s*:/.test(app));

const browser=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../js/dsa41/combat-talent-registry.js',import.meta.url),'utf8'),browser);
assert.equal(browser.HeldenMobilDsa41CombatTalents.COMBAT_TALENTS.length,27);
console.log('TALENT-E3 passed: 27 combat talents / 6 BASIC / 21 SPECIAL; canonical metadata, eBE delegation, snapshot and COMBAT fail-closed regressions');
