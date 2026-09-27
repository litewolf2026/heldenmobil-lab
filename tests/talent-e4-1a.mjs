import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

const talent=require('../js/dsa41/talent-core.js');
const proficiency=require('../js/dsa41/proficiency-core.js');
const combat=require('../js/dsa41/combat-talent-registry.js');
const providerApi=require('../js/bridge-heldenmobil-provider.js');
const contract=require('../js/bridge-contract-v1.js');

const ordinary=talent.ORDINARY_TALENTS;
assert.equal(ordinary.length,105,'E1 ordinary catalog size remains 105');

const keys=ordinary.map(def=>def.key);
assert.equal(new Set(keys).size,105,'all ordinary talent keys are unique');
for(const def of ordinary){
  assert.match(def.key,/^talent\.[a-z0-9]+(?:-[a-z0-9]+)*$/,'stable ordinary key namespace');
  assert.equal(talent.getTalentDefinition(def.key),def,`${def.key}: key lookup`);
  assert.equal(talent.getTalentDefinition(def.name),def,`${def.key}: canonical name lookup`);
  assert.ok(talent.sameTalentName(def.key,def.name),`${def.key}: key/name identity`);
  for(const alias of def.aliases){
    assert.equal(talent.getTalentDefinition(alias),def,`${def.key}: alias lookup ${alias}`);
    assert.ok(talent.sameTalentName(def.key,alias),`${def.key}: key/alias identity ${alias}`);
  }
}

assert.equal(talent.getTalentDefinition('talent.sinnenschaerfe').name,'Sinnenschärfe');
assert.equal(talent.getTalentDefinition('Sinnesschärfe').key,'talent.sinnenschaerfe');
assert.equal(talent.getTalentDefinition('Sinnenschärfe').key,'talent.sinnenschaerfe');
assert.equal(talent.getTalentDefinition('talent.schloesser-knacken').name,'Schlösser Knacken');
assert.equal(talent.getTalentDefinition('talent.koerperbeherrschung').name,'Körperbeherrschung');
assert.equal(talent.getTalentDefinition('talent.goetter-kulte').name,'Götter/Kulte');

const foreignKeys=new Set([
  ...proficiency.PROFICIENCIES.map(def=>def.key),
  ...combat.COMBAT_TALENTS.map(def=>def.key)
]);
for(const key of keys)assert.ok(!foreignKeys.has(key),`${key}: must not collide with proficiency/combat namespaces`);

const props=Object.entries(providerApi.SHORT_TO_FULL).map(([short,name])=>({name,value:12,mod:0}));
const hero={
  key:'e4-1a-hero',name:'E4.1a Testheld',props,
  talents:[
    {name:'Sinnesschärfe',probe:'(KL/IN/IN)',value:8,be:'-',specs:[]},
    {name:'Schlösser Knacken',probe:'(IN/FF/FF)',value:10,be:'-',specs:['Schlösser']},
    {name:'Prophezeien',probe:'(MU/IN/CH)',value:7,be:'-',specs:[]}
  ],
  spells:[],liturgyKnowledges:[],combat:[]
};
let diceUsed=0;
const provider=providerApi.createProvider({
  getHeroes:()=>[hero],
  getCombatState:()=>({be:0}),
  rollDie:()=>{diceUsed++;return 8;}
});

const snapshot=provider.getHeroSnapshot(hero.key);
const senses=snapshot.talents.find(row=>row.key==='talent.sinnenschaerfe');
assert.ok(senses,'known E1 alias must project under stable key');
assert.equal(senses.name,'Sinnenschärfe','snapshot name is canonical human-readable name');
assert.deepEqual(senses.attributes,['KL','IN','IN']);
const locks=snapshot.talents.find(row=>row.key==='talent.schloesser-knacken');
assert.ok(locks);
assert.equal(locks.name,'Schlösser Knacken');
const unknown=snapshot.talents.find(row=>row.name==='Prophezeien');
assert.deepEqual([unknown?.key,unknown?.name],['Prophezeien','Prophezeien'],'unknown legacy rows remain untouched');

function dsaRequest(key,id){
  return contract.checkRequestV1({
    requestId:id,heroId:hero.key,check:{kind:'talent',key,mode:'standard'},modifier:2,
    context:{talent:{ruleProfile:'dsa41-v1',specialization:'Schlösser'}}
  });
}
const byKey=provider.executeCheck(dsaRequest('talent.schloesser-knacken','e4-key'));
const byName=provider.executeCheck(dsaRequest('Schlösser Knacken','e4-name'));
assert.equal(byKey.status,'resolved');
assert.equal(byName.status,'resolved');
assert.deepEqual(
  [byKey.success,byKey.outcome,byKey.qualityPoints,byKey.effectiveValue,byKey.meta.baseTaW,byKey.meta.usedAttributes,byKey.meta.specializationBonus],
  [byName.success,byName.outcome,byName.qualityPoints,byName.effectiveValue,byName.meta.baseTaW,byName.meta.usedAttributes,byName.meta.specializationBonus],
  'stable key and canonical name use the exact same TALENT resolver semantics'
);

const aliasResult=provider.executeCheck(dsaRequest('talent.sinnenschaerfe','e4-alias-key'));
assert.equal(aliasResult.status,'resolved','stable key must resolve alias-named HLD talent');
assert.deepEqual(aliasResult.meta.usedAttributes,['KL','IN','IN']);

const legacy=contract.checkRequestV1({
  requestId:'e4-legacy-name',heroId:hero.key,check:{kind:'talent',key:'Schlösser Knacken',mode:'standard'},modifier:0,context:{}
});
const legacyResult=provider.executeCheck(legacy);
assert.equal(legacyResult.status,'resolved','legacy name request without dsa41-v1 remains backward compatible');
assert.equal(diceUsed,12,'four ordinary checks consume exactly three d20 each');

console.log('TALENT-E4.1a passed: 105 stable talent.* keys; key/name/alias lookup, snapshot and request compatibility');
