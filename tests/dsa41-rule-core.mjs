import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const dice=require('../js/dsa41/dice-core.js');
const check=require('../js/dsa41/check-core.js');
const combat=require('../js/dsa41/combat-core.js');
const damage=require('../js/dsa41/damage-core.js');
const modifier=require('../js/dsa41/modifier-core.js');
const magic=require('../js/dsa41/magic-core.js');
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/hld-ap19-samples.json',import.meta.url),'utf8'));
function eq(actual,expected,label){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(`${label}: expected ${e}, got ${a}`);}
function ok(value,label){if(!value)throw new Error(label);}

const seq=dice.createSequenceRoller([20,1,6,10,11,12]);
eq([seq.d20(),seq.d20(),seq.d6()],[20,1,6],'sequence dice');eq(seq.threeD20(),[10,11,12],'sequence 3W20');eq(seq.remaining(),0,'sequence consumed');

let r=check.checkTalent({values:[10,10,10],skill:0,modifier:0,rolls:[10,10,10]});eq([r.success,r.points],[true,1],'TaW 0 minimum 1 TaP*');
r=check.checkTalent({values:[10,10,10],skill:4,modifier:0,rolls:[4,12,8]});eq([r.success,r.points,r.spent],[true,2,2],'positive TaW spends points');
r=check.checkTalent({values:[10,10,10],skill:-2,modifier:0,rolls:[10,10,10]});eq([r.success,r.targets],[false,[8,8,8]],'negative TaW lowers all three attributes');
r=check.checkTalent({values:[10,10,10],skill:-2,modifier:0,rolls:[7,7,6]});eq([r.success,r.points],[true,1],'negative TaW can succeed');
r=check.checkTalent({values:[10,10,10],skill:0,modifier:2,rolls:[6,8,8]});eq([r.success,r.effectiveSkill,r.targets],[true,-2,[8,8,8]],'difficulty can create negative effective TaW');
eq(check.checkTalent({values:[10,10,10],skill:3,rolls:[1,1,20]}).outcome,'critical-success','double one classified');eq(check.checkTalent({values:[10,10,10],skill:3,rolls:[1,1,1]}).outcome,'triple-one','triple one classified separately');eq(check.checkTalent({values:[18,18,18],skill:18,rolls:[20,20,1]}).outcome,'fumble','double twenty classified');eq(check.checkTalent({values:[18,18,18],skill:18,rolls:[20,20,20]}).outcome,'triple-twenty','triple twenty classified separately');

eq(check.checkAttribute({value:10,modifier:0,roll:10}).success,true,'attribute exact target');eq(check.checkAttribute({value:10,modifier:0,roll:11}).success,false,'attribute above target');
eq(combat.adjustCombatForBE(15,14,3),{at:14,pa:12},'existing odd eBE distribution retained');eq(combat.finalDamage([1,6,2],[11,4],15),[1,6,3],'existing TP/KK retained');eq(combat.attackCheck({target:16,modifier:3,roll:13}).success,true,'AT check uses difficulty');eq(combat.parryCheck({target:14,modifier:2,roll:13}).success,false,'PA check uses difficulty');
r=combat.attackCheck({target:25,roll:20});eq([r.success,r.requiresConfirmation,r.confirmationKind],[false,true,'fumble'],'natural 20 never succeeds even above target');
r=combat.attackCheck({target:0,roll:1});eq([r.success,r.requiresConfirmation,r.confirmationKind],[true,true,'critical-success'],'natural 1 succeeds and requires confirmation');

eq(damage.damageAfterArmor(11,5),{tp:11,rs:5,sp:6},'TP-RS-SP');eq(damage.damageAfterArmor(4,9).sp,0,'armor floors SP at zero');eq(damage.directDamage(7),{tp:null,rs:null,sp:7,direct:true},'direct SP bypasses RS');

const mods=[modifier.modifier({source:'MR',value:4,reason:'target resistance'}),modifier.modifier({source:'SL',value:-2,reason:'situational relief'})];eq(modifier.total(mods),2,'modifier pipeline total');eq(modifier.explain(mods)[0].source,'MR','modifier provenance');

r=magic.spellCheck({values:[10,10,10],zfw:2,modifier:0,mr:4,rolls:[9,9,9]});eq([r.effectiveSkill,r.targets,r.success],[-2,[8,8,8],false],'MR creates negative effective ZfW before rolling');
eq(magic.resourceDeltaPreview({current:5,cost:7}),{resource:'AsP',current:5,cost:7,allowed:false,next:0,delta:-5},'resource preview never goes below zero');

eq(fixture.coverage.heroes,34,'HLD hero coverage');ok(fixture.coverage.sfDistinct>=400,'HLD covers broad SF set');
const martial=fixture.samples.martial;r=check.checkTalent({values:martial.probe,skill:martial.talentValue,rolls:[18,19,16]});eq([r.success,r.points],[true,16],'martial HLD-derived talent fixture');
const spell=fixture.samples.magic;r=magic.spellCheck({values:spell.probe,zfw:spell.spellValue,mr:4,rolls:[18,14,14]});eq([r.success,r.points,r.effectiveSkill],[true,10,12],'magic HLD-derived spell fixture with MR');
const karmal=fixture.samples.karmal;r=check.checkLiturgy({values:karmal.probe,skill:karmal.liturgyKnowledge,rolls:[16,16,14]});eq([r.success,r.points],[true,13],'karmal HLD-derived fixture');

console.log('AP19.1 DSA 4.1 rule-core regression tests passed');
