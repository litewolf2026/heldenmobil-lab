import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const bridge=require('../js/bridge-contract-v1.js');
const effects=require('../js/dsa41/effect-core.js');

function eq(actual,expected,label){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(`${label}: expected ${e}, got ${a}`);}
function ok(value,label){if(!value)throw new Error(label);}
function throws(fn,label){let did=false;try{fn();}catch(_){did=true;}if(!did)throw new Error(`${label}: expected exception`);}

const hero=bridge.heroSnapshotV1({
  heroId:'hero:test:1',name:'Testheld',
  attributes:{MU:13,KL:12,IN:14,CH:11,FF:10,GE:15,KO:13,KK:14},
  energies:{LeP:{current:31,max:35},AuP:{current:36,max:40},AsP:{current:22,max:28}},
  talents:[{name:'Sinnesschärfe',value:11,attributes:['KL','IN','IN']}],
  spells:[{name:'Odem Arcanum',value:9,attributes:['KL','IN','IN'],representation:'Mag',complexity:'A'}],
  combat:{atBasis:8,paBasis:8,fkBasis:8,iniBase:12,rs:3,be:1},
  capabilities:['check:talent','check:spell','combat:basic'],
  display:{portraitRef:'portrait:test'},source:{product:'heldenmobil-lab',heroRevision:'fixture-1'}
});
eq([hero.schema,hero.version,hero.heroId,hero.talents[0].value],['HeroSnapshotV1',1,'hero:test:1',11],'HeroSnapshotV1 basic shape');
eq(bridge.validateContractV1(JSON.parse(JSON.stringify(hero))),hero,'HeroSnapshotV1 JSON roundtrip');
throws(()=>bridge.heroSnapshotV1({heroId:'x',name:'X',attributes:{MU:Infinity}}),'hero snapshot rejects non-finite values');
throws(()=>bridge.validateContractV1({...hero,version:2}),'version mismatch fails closed');

const request=bridge.checkRequestV1({
  requestId:'req:maze:17',heroId:hero.heroId,
  check:{kind:'talent',key:'Sinnesschärfe',label:'Sinnesschärfe'},modifier:3,
  modifiers:[{source:'shared-maze',value:3,reason:'verborgene Falle',kind:'difficulty'}],
  context:{source:'shared-maze',reason:'verborgene Falle',entityRef:'trap:17',hiddenRoll:true,advisoryAttributes:['KL','IN','IN']}
});
eq([request.check.kind,request.check.key,request.modifier],['talent','Sinnesschärfe',3],'CheckRequestV1 identifies check without sending TaW');
ok(!('skill' in request.check)&&!('value' in request.check),'CheckRequestV1 does not transport authoritative hero skill values');
throws(()=>bridge.checkRequestV1({requestId:'x',heroId:'h',check:{kind:'unknown',key:'X'}}),'unknown check kind fails closed');

const denied=bridge.resourceDeltaV1({resource:'AsP',current:5,delta:-7,allowed:false,reason:'zu wenig AsP',source:'magic-core'});
eq([denied.allowed,denied.current,denied.delta,denied.next],[false,5,-7,5],'denied ResourceDeltaV1 does not silently spend/clamp');
const spent=bridge.resourceDeltaV1({resource:'AsP',current:12,delta:-5,allowed:true,reason:'Zauberkosten',source:'magic-core'});
eq([spent.allowed,spent.next],[true,7],'allowed ResourceDeltaV1 computes next state');
throws(()=>bridge.resourceDeltaV1({resource:'AsP',current:2,delta:-3,allowed:true}),'allowed delta may not go below zero');

const result=bridge.checkResultV1({
  requestId:request.requestId,heroId:hero.heroId,checkKind:'talent',status:'resolved',success:true,outcome:'success',qualityPoints:6,
  rolls:[7,12,9],targets:[12,14,14],effectiveValue:8,modifiers:request.modifiers,
  effects:[effects.manualEffect({source:'Sinnesschärfe',reason:'Dungeonwirkung wird durch Shared Maze/SL aufgelöst'})],
  resourceDeltas:[],display:{summary:'Gelungen · 6 TaP*'},meta:{ruleCore:'dsa41-v1'}
});
eq([result.success,result.qualityPoints,result.effects[0].type],[true,6,'manual'],'CheckResultV1 carries quality and generic effect');
eq(bridge.validateCheckResultV1(JSON.parse(JSON.stringify(result))),result,'CheckResultV1 JSON roundtrip');
const unsupported=bridge.checkResultV1({requestId:'req:x',heroId:hero.heroId,checkKind:'spell',status:'unsupported',success:null,outcome:'spell-effect-unmodeled'});
eq([unsupported.status,unsupported.success],['unsupported',null],'unsupported check result is explicit');
throws(()=>bridge.checkResultV1({requestId:'req:x',heroId:hero.heroId,checkKind:'talent',status:'resolved',success:null}),'resolved result requires boolean success');

const action=bridge.combatActionV1({actionId:'combat:1',heroId:hero.heroId,kind:'attack',targetRef:'actor:goblin',weaponRef:'weapon:sword',maneuvers:[{key:'Wuchtschlag',announcement:3}],modifier:0,context:{runId:'run:1'}});
eq([action.schema,action.maneuvers[0].key],['CombatActionV1','Wuchtschlag'],'CombatActionV1 prepared without hard-coded maneuver schema');
const combatResult=bridge.combatResultV1({actionId:action.actionId,heroId:hero.heroId,status:'resolved',checkResult:bridge.checkResultV1({requestId:'combat:1:at',heroId:hero.heroId,checkKind:'attack',status:'resolved',success:true,outcome:'success',rolls:[9],targets:[14]}),effects:[effects.damageEffect({source:'Wuchtschlag',amount:8,kind:'TP',armorApplies:true})],resourceDeltas:[],display:{summary:'Treffer'}});
eq([combatResult.schema,combatResult.effects[0].type],['CombatResultV1','damage'],'CombatResultV1 prepared for later APs');

console.log('AP19.2 Bridge Contract V1 regression tests passed');
