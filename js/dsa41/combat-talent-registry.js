(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41CombatTalents=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const COMBAT_CLASS=Object.freeze({ARMED_MELEE:'ARMED_MELEE',RANGED:'RANGED',ATTACK_ONLY:'ATTACK_ONLY',UNARMED:'UNARMED'});
  const TALENT_TYPE=Object.freeze({BASIC:'BASIC',SPECIAL:'SPECIAL'});
  const RESOLUTION_MODE=Object.freeze({COMBAT:'COMBAT'});
  const RAW=[
  {
    "key": "combat.anderthalbhaender",
    "name": "Anderthalbhänder",
    "aliases": [],
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
  {
    "key": "combat.armbrust",
    "name": "Armbrust",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "C",
    "encumbranceRule": "BE-5",
    "substitutes": [
      "combat.bogen"
    ],
    "specializationAllowed": true
  },
  {
    "key": "combat.belagerungswaffen",
    "name": "Belagerungswaffen",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": null,
    "substitutes": [],
    "specializationAllowed": true
  },
  {
    "key": "combat.blasrohr",
    "name": "Blasrohr",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-5",
    "substitutes": [],
    "specializationAllowed": false
  },
  {
    "key": "combat.bogen",
    "name": "Bogen",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-3",
    "substitutes": [],
    "specializationAllowed": true
  },
  {
    "key": "combat.diskus",
    "name": "Diskus",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-2",
    "substitutes": [],
    "specializationAllowed": false
  },
  {
    "key": "combat.dolche",
    "name": "Dolche",
    "aliases": [],
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
  {
    "key": "combat.fechtwaffen",
    "name": "Fechtwaffen",
    "aliases": [],
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
  {
    "key": "combat.hiebwaffen",
    "name": "Hiebwaffen",
    "aliases": [],
    "combatClass": "ARMED_MELEE",
    "type": "BASIC",
    "advancementColumn": "D",
    "encumbranceRule": "BE-4",
    "substitutes": [
      "combat.saebel"
    ],
    "specializationAllowed": true
  },
  {
    "key": "combat.infanteriewaffen",
    "name": "Infanteriewaffen",
    "aliases": [],
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
  {
    "key": "combat.kettenstaebe",
    "name": "Kettenstäbe",
    "aliases": [],
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
  {
    "key": "combat.kettenwaffen",
    "name": "Kettenwaffen",
    "aliases": [],
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
  {
    "key": "combat.lanzenreiten",
    "name": "Lanzenreiten",
    "aliases": [],
    "combatClass": "ATTACK_ONLY",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": null,
    "substitutes": [],
    "specializationAllowed": false
  },
  {
    "key": "combat.peitsche",
    "name": "Peitsche",
    "aliases": [],
    "combatClass": "ATTACK_ONLY",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-1",
    "substitutes": [],
    "specializationAllowed": false
  },
  {
    "key": "combat.raufen",
    "name": "Raufen",
    "aliases": [],
    "combatClass": "UNARMED",
    "type": "BASIC",
    "advancementColumn": "C",
    "encumbranceRule": "BE",
    "substitutes": [],
    "specializationAllowed": false
  },
  {
    "key": "combat.ringen",
    "name": "Ringen",
    "aliases": [],
    "combatClass": "UNARMED",
    "type": "BASIC",
    "advancementColumn": "D",
    "encumbranceRule": "BE",
    "substitutes": [],
    "specializationAllowed": false
  },
  {
    "key": "combat.saebel",
    "name": "Säbel",
    "aliases": [],
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
  {
    "key": "combat.schleuder",
    "name": "Schleuder",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "E",
    "encumbranceRule": "BE-2",
    "substitutes": [],
    "specializationAllowed": true
  },
  {
    "key": "combat.schwerter",
    "name": "Schwerter",
    "aliases": [],
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
  {
    "key": "combat.speere",
    "name": "Speere",
    "aliases": [],
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-3",
    "substitutes": [
      "combat.infanteriewaffen"
    ],
    "specializationAllowed": true
  },
  {
    "key": "combat.staebe",
    "name": "Stäbe",
    "aliases": [],
    "combatClass": "ARMED_MELEE",
    "type": "SPECIAL",
    "advancementColumn": "D",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.speere"
    ],
    "specializationAllowed": true
  },
  {
    "key": "combat.wurfbeile",
    "name": "Wurfbeile",
    "aliases": [],
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
  {
    "key": "combat.wurfmesser",
    "name": "Wurfmesser",
    "aliases": [],
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
  {
    "key": "combat.wurfspeere",
    "name": "Wurfspeere",
    "aliases": [],
    "combatClass": "RANGED",
    "type": "SPECIAL",
    "advancementColumn": "C",
    "encumbranceRule": "BE-2",
    "substitutes": [
      "combat.wurfbeile"
    ],
    "specializationAllowed": true
  },
  {
    "key": "combat.zweihandflegel",
    "name": "Zweihandflegel",
    "aliases": [],
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
  {
    "key": "combat.zweihand-hiebwaffen",
    "name": "Zweihand-Hiebwaffen",
    "aliases": [
      "Zweihandhiebwaffen"
    ],
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
  {
    "key": "combat.zweihandschwerter-saebel",
    "name": "Zweihandschwerter/-säbel",
    "aliases": [],
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
];
  function norm(value){return String(value??'').normalize('NFC').trim().toLocaleLowerCase('de-DE').replace(/\s+/g,' ');}
  function freezeDefinition(def){return Object.freeze({
    key:String(def.key),name:String(def.name),aliases:Object.freeze([...(def.aliases||[])]),
    combatClass:String(def.combatClass),type:String(def.type),advancementColumn:String(def.advancementColumn),
    encumbranceRule:def.encumbranceRule==null?null:String(def.encumbranceRule),
    substitutes:Object.freeze([...(def.substitutes||[])]),specializationAllowed:!!def.specializationAllowed,
    resolutionMode:RESOLUTION_MODE.COMBAT
  });}
  const COMBAT_TALENTS=Object.freeze(RAW.map(freezeDefinition)),BY_KEY=new Map(),BY_LABEL=new Map();
  for(const def of COMBAT_TALENTS){
    const key=norm(def.key);if(BY_KEY.has(key))throw new Error(`duplicate combat key: ${def.key}`);BY_KEY.set(key,def);
    for(const label of [def.name,...def.aliases]){const k=norm(label);if(BY_LABEL.has(k))throw new Error(`duplicate combat label: ${label}`);BY_LABEL.set(k,def);}
  }
  for(const def of COMBAT_TALENTS){
    if(!Object.values(COMBAT_CLASS).includes(def.combatClass))throw new Error(`${def.key}: invalid combat class`);
    if(!Object.values(TALENT_TYPE).includes(def.type))throw new Error(`${def.key}: invalid talent type`);
    for(const key of def.substitutes)if(!BY_KEY.has(norm(key)))throw new Error(`${def.key}: unknown substitute ${key}`);
  }
  function getCombatTalentDefinition(value){const k=norm(value);return k?(BY_KEY.get(k)||BY_LABEL.get(k)||null):null;}
  function isCombatKey(value){return /^combat\.[a-z0-9-]+$/i.test(String(value??'').trim());}
  function encumbrancePenalty(value,be){
    const def=typeof value==='object'&&value?.key?value:getCombatTalentDefinition(value);if(!def)return null;
    const amount=Number(be);if(!Number.isFinite(amount))throw new TypeError('BE must be finite');const current=Math.max(0,amount),rule=def.encumbranceRule;
    if(rule==null)return 0;if(rule==='BE')return current;const m=/^BE-(\d+)$/.exec(rule);if(m)return Math.max(0,current-Number(m[1]));
    throw new RangeError(`unsupported combat eBE rule: ${rule}`);
  }
  function canonicalSnapshotMeta(value){const def=getCombatTalentDefinition(value);return def?{
    key:def.key,canonicalName:def.name,resolutionMode:def.resolutionMode,combatClass:def.combatClass,type:def.type,
    advancementColumn:def.advancementColumn,encumbranceRule:def.encumbranceRule,substitutes:[...def.substitutes],
    specializationAllowed:def.specializationAllowed
  }:null;}
  return {COMBAT_CLASS,TALENT_TYPE,RESOLUTION_MODE,COMBAT_TALENTS,norm,getCombatTalentDefinition,isCombatKey,encumbrancePenalty,canonicalSnapshotMeta};
});
