import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const check=require('../js/dsa41/check-core.js');
const talent=require('../js/dsa41/talent-core.js');
function eq(actual,expected,label){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(`${label}: expected ${e}, got ${a}`);}
function ok(value,label){if(!value)throw new Error(label);}
function throws(fn,label){let error=null;try{fn();}catch(caught){error=caught;}if(!error)throw new Error(label);return error;}

let r=check.checkTalent({values:[10,10,10],skill:4,modifier:-7,rolls:[1,2,3]});
eq([r.success,r.points,r.effectiveSkill,r.qualityCap],[true,4,11,4],'relief never raises TaP* above actual TaW');
r=check.checkTalent({values:[10,10,10],skill:7,modifier:3,rolls:[1,1,20]});
eq([r.success,r.outcome,r.points],[true,'critical-success',7],'double one keeps all TaP as TaP*');
r=check.checkTalent({values:[18,18,18],skill:12,rolls:[20,20,1]});
eq([r.success,r.outcome,r.points],[false,'fumble',0],'double twenty yields no TaP*');
r=check.checkSpell({values:[10,10,10],skill:4,modifier:-7,rolls:[2,2,2]});
eq([r.success,r.points,r.effectiveSkill],[true,11,11],'TALENT-A does not cap existing spell quality points');
r=check.checkLiturgy({values:[10,10,10],skill:4,modifier:-7,rolls:[2,2,2]});
eq([r.success,r.points,r.effectiveSkill],[true,11,11],'TALENT-A does not cap existing liturgy quality points');

const heroes=[
  {name:'Klettern',probe:'MU/GE/KK',value:-2,be:'BE*2',specs:['Seilklettern']},
  {name:'Feinmechanik',probe:'KL/FF/FF',value:9,be:'-',specs:['Schl\u00f6sser']}
];
let available=talent.talentAvailability({name:'Klettern',heroTalents:heroes});
eq([available.status,available.definition.type,available.talent.value],['available','basic',-2],'negative basic talent remains available');
available=talent.talentAvailability({name:'Mechanik',heroTalents:heroes});
eq([available.status,available.definition.type],['unactivated-special','special'],'missing special talent is unactivated, not TaW 0');

const negativeSpecial={name:'Schl\u00f6sser Knacken',probe:'IN/FF/FF',value:-1,be:'-',specs:[]};
available=talent.talentAvailability({name:'Schl\u00f6sser Knacken',heroTalents:[...heroes,negativeSpecial]});
eq([available.status,available.definition.type,available.talent.value],['special-value-negative','special',-1],'negative special talent is not directly available');
throws(()=>talent.resolveTalentCheck({
  talent:negativeSpecial,heroAttributes:{MU:10,KL:10,IN:12,CH:10,FF:13,GE:10,KO:10,KK:10},rolls:[8,8,8]
}),'negative special talent must not resolve as a direct check');

const options=talent.substitutionOptions({name:'Schl\u00f6sser Knacken',heroTalents:heroes});
eq(options.map(x=>[x.talent.name,x.penalty]),[['Feinmechanik',5]],'related talent substitution is catalogue-driven');

eq(talent.encumbrancePenalty('BE*2',3),6,'BE*2');
eq(talent.encumbrancePenalty('BE-2',3),1,'BE-2');
eq(talent.encumbrancePenalty('BE-4',3),0,'BE reduction floors at zero');

r=talent.resolveTalentCheck({
  talent:heroes[0],heroAttributes:{MU:12,KL:11,IN:10,CH:9,FF:8,GE:13,KO:14,KK:15},
  modifier:0,be:2,attributeOverride:['KL','IN','FF'],specialization:'Seilklettern',rolls:[8,9,7]
});
eq([r.attributeKeys,r.baseSkill,r.specializationBonus,r.skill,r.encumbrancePenalty,r.totalModifier],[["KL","IN","FF"],-2,2,0,4,4],'override, specialization and eBE compose before check');
eq([r.result.effectiveSkill,r.result.targets,r.result.success],[-4,[7,6,4],false],'negative effective TaW is applied to all override attributes');

const sense={name:'Sinnessch\u00e4rfe',probe:'(KL/IN/IN)',value:8,be:'-',specs:[]};
available=talent.talentAvailability({name:'Sinnensch\u00e4rfe',heroTalents:[sense]});
eq([available.status,available.talent.name,available.definition.name],['available','Sinnessch\u00e4rfe','Sinnensch\u00e4rfe'],'canonical request matches HLD talent alias');
eq(talent.findHeroTalent([sense],'Sinnensch\u00e4rfe')?.name,'Sinnessch\u00e4rfe','alias matching is used by HLD talent lookup');
r=talent.resolveTalentCheck({talent:sense,heroAttributes:{KL:12,IN:13,FF:11,MU:10,CH:10,GE:10,KO:10,KK:10},attributeOverride:['KL','IN','FF'],modifier:-5,rolls:[8,9,10]});
eq([r.attributeKeys,r.result.points,r.result.qualityCap],[['KL','IN','FF'],8,8],'alternate attributes preserve TaP* cap under relief');

ok(!('extended' in talent)&&!('resolveExtendedCheck' in talent),'TALENT-A does not introduce long-term checks');
console.log('TALENT-A rule-core regression tests passed');
