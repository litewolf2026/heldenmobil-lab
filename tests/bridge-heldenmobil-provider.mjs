import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const providerApi=require('../js/bridge-heldenmobil-provider.js');
const contract=require('../js/bridge-contract-v1.js');

function eq(actual,expected,label){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(`${label}: expected ${e}, got ${a}`);}
function ok(value,label){if(!value)throw new Error(label);}

const props=[
  ['Mut',13],['Klugheit',12],['Intuition',14],['Charisma',11],['Fingerfertigkeit',10],['Gewandtheit',15],['Konstitution',13],['Körperkraft',14]
].map(([name,value])=>({name,value,mod:0}));
const hero={
  key:'hero-live-1',name:'Live Testheld',race:'Mensch',culture:'Gareth',profession:'Streuner',props,
  talents:[
    {name:'Sinnesschärfe',probe:'(KL/IN/IN)',value:11,be:'-',specs:[]},
    {name:'Klettern',probe:'MU/GE/KK',value:8,be:'BE*2',specs:['Seilklettern']},
    {name:'Feinmechanik',probe:'KL/FF/FF',value:9,be:'-',specs:['Schlösser']},
    {name:'Schlösser Knacken',probe:'IN/FF/FF',value:-1,be:'-',specs:[]},
    {name:'Kochen',probe:'KL/IN/FF',value:5,be:'-',specs:[]},
    {name:'Unbekanntes Haustalent',probe:'KL/IN/FF',value:5,be:'-',specs:[]}
  ],
  spells:[{name:'Odem Arcanum',probe:'KL/IN/IN',value:9,rep:'Mag',column:'A'}],
  liturgyKnowledges:[{name:'Liturgiekenntnis (Phex)',probe:'MU/IN/CH',value:10}],
  combat:[{name:'Dolche',at:14,pa:12}]
};
let dice=[],i=0;
function setDice(values){dice=[...values];i=0;}
const rollDie=sides=>{if(i>=dice.length)throw new Error('fixture dice exhausted');const value=dice[i++];if(value>sides)throw new Error('bad fixture die');return value;};
const provider=providerApi.createProvider({
  getHeroes:()=>[hero],rollDie,
  getEnergyState:()=>({LeP:{current:28,max:35},AuP:{current:32,max:40},AsP:{current:20,max:28}}),
  getCombatState:h=>({combatTalents:h.combat,rs:2,be:1})
});

eq(provider.bridgeCapabilities,['check:talent-context:v1'],'provider advertises opt-in talent context capability');
const list=provider.listHeroes();eq(list,[{heroId:'hero-live-1',name:'Live Testheld',capabilities:['check:attribute','check:talent','check:spell','check:liturgy']}],'provider exposes narrow hero list');
const snapshot=provider.getHeroSnapshot('hero-live-1');eq([snapshot.schema,snapshot.attributes.MU,snapshot.energies.LeP.current,snapshot.spells[0].representation,snapshot.combat.rs],['HeroSnapshotV1',13,28,'Mag',2],'provider creates real HeroSnapshotV1 shape');
ok(!('props' in snapshot)&&!('sfSet' in snapshot),'snapshot does not leak parser internals');

setDice([7,12,9]);
let request=contract.checkRequestV1({requestId:'t1',heroId:'hero-live-1',check:{kind:'talent',key:'Sinnesschärfe'},modifier:3,modifiers:[{source:'maze',value:3,reason:'Falle'}]});
let result=provider.executeCheck(request);eq([result.status,result.success,result.qualityPoints,result.rolls,result.targets,result.effectiveValue],['resolved',true,8,[7,12,9],[12,14,14],8],'legacy talent check remains unchanged');

setDice([9,10,11]);
request=contract.checkRequestV1({requestId:'s1',heroId:'hero-live-1',check:{kind:'spell',key:'Odem Arcanum'},modifier:1,context:{magicResistance:2}});
result=provider.executeCheck(request);eq([result.status,result.checkKind,result.meta.magicResistance,result.effectiveValue,result.rolls],['resolved','spell',2,6,[9,10,11]],'spell check adds MR before 3W20 via magic core');

setDice([8,7,6]);
request=contract.checkRequestV1({requestId:'l1',heroId:'hero-live-1',check:{kind:'liturgy',key:'Liturgiekenntnis (Phex)'},modifier:0});
result=provider.executeCheck(request);eq([result.status,result.checkKind,result.success,result.rolls],['resolved','liturgy',true,[8,7,6]],'liturgy knowledge uses shared 3W20 core');

setDice([10]);
request=contract.checkRequestV1({requestId:'a1',heroId:'hero-live-1',check:{kind:'attribute',key:'MU'},modifier:2});
result=provider.executeCheck(request);eq([result.status,result.success,result.rolls,result.targets],['resolved',true,[10],[11]],'attribute check resolves from HLD property');

request=contract.checkRequestV1({requestId:'x1',heroId:'hero-live-1',check:{kind:'attack',key:'Dolche'},modifier:0});
result=provider.executeCheck(request);eq([result.status,result.success,result.outcome],['unsupported',null,'check-kind-not-yet-bound'],'combat stays explicit unsupported until bound');

request=contract.checkRequestV1({requestId:'missing',heroId:'hero-live-1',check:{kind:'talent',key:'Unbekannt'},modifier:0});
result=provider.executeCheck(request);eq([result.status,result.outcome],['unsupported','ability-not-found'],'legacy unknown HLD ability fails explicitly');

setDice([7,12,9]);
request=contract.checkRequestV1({
  requestId:'tb1-sense',heroId:'hero-live-1',check:{kind:'talent',key:'Sinnenschärfe'},modifier:3,
  modifiers:[{source:'maze',value:3,reason:'Falle'}],
  context:{talent:{ruleProfile:'dsa41-v1'}}
});
result=provider.executeCheck(request);
eq([result.status,result.success,result.qualityPoints,result.meta.ruleProfile,result.meta.baseTaW,result.meta.usedAttributes,result.meta.totalModifier],
  ['resolved',true,8,'dsa41-v1',11,['KL','IN','IN'],3],
  'opt-in canonical talent request resolves through talent core');

setDice([7,8,9]);
request=contract.checkRequestV1({
  requestId:'tb1-override',heroId:'hero-live-1',check:{kind:'talent',key:'Klettern'},modifier:1,
  modifiers:[{source:'maze',value:1,reason:'glatte Wand'}],
  context:{talent:{ruleProfile:'dsa41-v1',attributeOverride:['KL','IN','FF'],specialization:'Seilklettern'}}
});
result=provider.executeCheck(request);
eq([result.status,result.success,result.qualityPoints,result.effectiveValue,result.meta.baseTaW,result.meta.usedAttributes,result.meta.specializationBonus,result.meta.encumbranceRule,result.meta.encumbrancePenalty,result.meta.externalModifier,result.meta.totalModifier],
  ['resolved',true,7,7,8,['KL','IN','FF'],2,'BE*2',2,1,3],
  'talent context composes override specialization eBE and external modifier');
eq(result.modifiers,[
  {source:'maze',value:1,reason:'glatte Wand',kind:'difficulty'},
  {source:'heldenmobil',value:2,reason:'eBE BE*2',kind:'encumbrance'}
],'result exposes eBE as a transparent HeldenMobil modifier');

setDice([7,8,9]);
request=contract.checkRequestV1({
  requestId:'tb1-no-spec',heroId:'hero-live-1',check:{kind:'talent',key:'Klettern'},modifier:0,
  context:{talent:{ruleProfile:'dsa41-v1',specialization:'Felsklettern'}}
});
result=provider.executeCheck(request);
eq([result.status,result.meta.specialization,result.meta.specializationBonus,result.meta.encumbrancePenalty,result.meta.totalModifier],
  ['resolved','Felsklettern',0,2,2],
  'unknown specialization context does not grant a bonus');

request=contract.checkRequestV1({
  requestId:'tb1-unactivated',heroId:'hero-live-1',check:{kind:'talent',key:'Mechanik'},modifier:0,
  context:{talent:{ruleProfile:'dsa41-v1'}}
});
result=provider.executeCheck(request);
eq([result.status,result.outcome],['unsupported','special-talent-unactivated'],'unactivated special talent is not rolled');

request=contract.checkRequestV1({
  requestId:'tb1-negative',heroId:'hero-live-1',check:{kind:'talent',key:'Schlösser Knacken'},modifier:0,
  context:{talent:{ruleProfile:'dsa41-v1'}}
});
result=provider.executeCheck(request);
eq([result.status,result.outcome,result.meta.substitutions],[ 'unsupported','special-talent-negative',[{talent:'Feinmechanik',penalty:5}]],'negative special talent is blocked while substitution options are only reported');

request=contract.checkRequestV1({
  requestId:'tb1-unknown-model',heroId:'hero-live-1',check:{kind:'talent',key:'Unbekanntes Haustalent'},modifier:0,
  context:{talent:{ruleProfile:'dsa41-v1'}}
});
result=provider.executeCheck(request);
eq([result.status,result.outcome],['unsupported','talent-definition-unavailable'],'unmodelled talent never falls back to legacy resolver under dsa41-v1');

request=contract.checkRequestV1({
  requestId:'tb1-unknown-profile',heroId:'hero-live-1',check:{kind:'talent',key:'Sinnesschärfe'},modifier:0,
  context:{talent:{ruleProfile:'dsa41-v2'}}
});
result=provider.executeCheck(request);
eq([result.status,result.outcome,result.meta.requestedRuleProfile,result.meta.supportedRuleProfile],
  ['unsupported','talent-rule-profile-unsupported','dsa41-v2','dsa41-v1'],
  'unknown explicit talent rule profile fails closed without legacy fallback');

const noBeProvider=providerApi.createProvider({
  getHeroes:()=>[hero],rollDie:()=>10,getCombatState:()=>({})
});
request=contract.checkRequestV1({
  requestId:'tb1-no-be',heroId:'hero-live-1',check:{kind:'talent',key:'Klettern'},modifier:0,
  context:{talent:{ruleProfile:'dsa41-v1'}}
});
result=noBeProvider.executeCheck(request);
eq([result.status,result.outcome,result.meta.encumbranceRule],['unsupported','encumbrance-state-unavailable','BE*2'],'missing required BE fails closed instead of assuming BE 0');

setDice([6,6,6]);
request=contract.checkRequestV1({
  requestId:'tb1-advisory',heroId:'hero-live-1',check:{kind:'talent',key:'Sinnenschärfe'},modifier:0,
  context:{advisoryAttributes:['MU','GE','KK'],talent:{ruleProfile:'dsa41-v1'}}
});
result=provider.executeCheck(request);
eq(result.meta.usedAttributes,['KL','IN','IN'],'legacy advisoryAttributes stay non-normative in dsa41-v1 path');

console.log('TALENT-B1 explicit HeldenMobil provider regression tests passed');
