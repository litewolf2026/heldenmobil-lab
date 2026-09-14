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
  talents:[{name:'Sinnesschärfe',probe:'(KL/IN/IN)',value:11},{name:'Klettern',probe:'MU/GE/KK',value:8}],
  spells:[{name:'Odem Arcanum',probe:'KL/IN/IN',value:9,rep:'Mag',column:'A'}],
  liturgyKnowledges:[{name:'Liturgiekenntnis (Phex)',probe:'MU/IN/CH',value:10}],
  combat:[{name:'Dolche',at:14,pa:12}]
};
let dice=[7,12,9,9,10,11,8,7,6,10],i=0;const rollDie=sides=>{const value=dice[i++];if(value>sides)throw new Error('bad fixture die');return value;};
const provider=providerApi.createProvider({
  getHeroes:()=>[hero],rollDie,
  getEnergyState:()=>({LeP:{current:28,max:35},AuP:{current:32,max:40},AsP:{current:20,max:28}}),
  getCombatState:h=>({combatTalents:h.combat,rs:2,be:1})
});

const list=provider.listHeroes();eq(list,[{heroId:'hero-live-1',name:'Live Testheld',capabilities:['check:attribute','check:talent','check:spell','check:liturgy']}],'provider exposes narrow hero list');
const snapshot=provider.getHeroSnapshot('hero-live-1');eq([snapshot.schema,snapshot.attributes.MU,snapshot.energies.LeP.current,snapshot.spells[0].representation,snapshot.combat.rs],['HeroSnapshotV1',13,28,'Mag',2],'provider creates real HeroSnapshotV1 shape');
ok(!('props' in snapshot)&&!('sfSet' in snapshot),'snapshot does not leak parser internals');

let request=contract.checkRequestV1({requestId:'t1',heroId:'hero-live-1',check:{kind:'talent',key:'Sinnesschärfe'},modifier:3,modifiers:[{source:'maze',value:3,reason:'Falle'}]});
let result=provider.executeCheck(request);eq([result.status,result.success,result.qualityPoints,result.rolls,result.targets,result.effectiveValue],['resolved',true,8,[7,12,9],[12,14,14],8],'talent check uses HLD value/probe and Rule Core');

request=contract.checkRequestV1({requestId:'s1',heroId:'hero-live-1',check:{kind:'spell',key:'Odem Arcanum'},modifier:1,context:{magicResistance:2}});
result=provider.executeCheck(request);eq([result.status,result.checkKind,result.meta.magicResistance,result.effectiveValue,result.rolls],['resolved','spell',2,6,[9,10,11]],'spell check adds MR before 3W20 via magic core');

request=contract.checkRequestV1({requestId:'l1',heroId:'hero-live-1',check:{kind:'liturgy',key:'Liturgiekenntnis (Phex)'},modifier:0});
result=provider.executeCheck(request);eq([result.status,result.checkKind,result.success,result.rolls],['resolved','liturgy',true,[8,7,6]],'liturgy knowledge uses shared 3W20 core');

request=contract.checkRequestV1({requestId:'a1',heroId:'hero-live-1',check:{kind:'attribute',key:'MU'},modifier:2});
result=provider.executeCheck(request);eq([result.status,result.success,result.rolls,result.targets],[ 'resolved',true,[10],[11]],'attribute check resolves from HLD property');

request=contract.checkRequestV1({requestId:'x1',heroId:'hero-live-1',check:{kind:'attack',key:'Dolche'},modifier:0});
result=provider.executeCheck(request);eq([result.status,result.success,result.outcome],['unsupported',null,'check-kind-not-yet-bound'],'combat stays explicit unsupported until bound');

request=contract.checkRequestV1({requestId:'missing',heroId:'hero-live-1',check:{kind:'talent',key:'Unbekannt'},modifier:0});
result=provider.executeCheck(request);eq([result.status,result.outcome],['unsupported','ability-not-found'],'unknown HLD ability fails explicitly');

console.log('AP19.3b explicit HeldenMobil provider regression tests passed');
