import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const combat=require('../js/combat-core.js');
const heroCombat=require('../js/dsa41/hero-combat-core.js');
const wounds=require('../js/dsa41/wound-core.js');
const conditions=require('../js/dsa41/condition-core.js');
const maneuvers=require('../js/dsa41/maneuver-core.js');
const magic=require('../js/dsa41/magic-core.js');
const hldCoverage=JSON.parse(fs.readFileSync(new URL('./fixtures/hld-ap19-coverage.json',import.meta.url),'utf8'));

function eq(actual,expected,label){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(`${label}: expected ${e}, got ${a}`);}
function ok(value,label){if(!value)throw new Error(label);}
function throws(fn,label){let did=false;try{fn();}catch(_){did=true;}if(!did)throw new Error(`${label}: expected exception`);}

// Real-HLD coverage is anonymized but kept machine-verifiable.
eq(hldCoverage.heroes,34,'HLD hero coverage');
eq(Object.values(hldCoverage.specialAbilities.classes).reduce((a,b)=>a+b,0),405,'all distinct HLD SF classified');
eq([hldCoverage.spells.distinct,hldCoverage.spells.checkReadyDistinct],[162,162],'all distinct HLD spells are check-ready');
eq([hldCoverage.spells.entryFieldPresence.nonEmptyCost,hldCoverage.spells.entryFieldPresence.nonEmptyRange,hldCoverage.spells.entryFieldPresence.nonEmptyCastingTime,hldCoverage.spells.entryFieldPresence.nonEmptyDuration],[0,0,0,0],'HLD is not a spell-effect database');

// MeisterGeister Kampf_Tests.cs TP/KK 13/3 numeric regression oracle.
for(const [kk,expected] of [[10,-1],[12,0],[14,0],[16,1],[18,1],[20,2],[21,2]]){
  eq(combat.tpkkModifier([13,3],kk).damage,expected,`MeisterGeister TP/KK 13/3 KK ${kk}`);
}
eq(combat.tpkkModifier([13,3],10).combatPenalty,1,'low KK also yields AT/PA penalty per full step');

// Extracted HeldenMobil combat calculations: parity-style vectors without UI state.
const weights={a:10,b:10};
let armor=heroCombat.armorSet({pieces:[{name:'Testpanzer',base:'Testpanzer',zones:{a:2,b:4},stars:1}],weights,specialAbilities:['Rüstungsgewöhnung II']});
eq([armor.rs,armor.baseBE,armor.be,armor.beReduction],[3,2,1,1],'armor + RG II');
eq(heroCombat.speedInfo({race:'Mensch',ge:16,be:2,flink:1}).value,8,'speed calculation parity');
eq(heroCombat.dodge({paBase:8,be:2,specialAbilities:['Ausweichen I','Ausweichen II'],flink:1,acrobatics:12}).value,14,'dodge SF and acrobatics');
let ini=heroCombat.initiativeForLoadout({iniBase:12,be:2,specialAbilities:['Kampfreflexe','Kampfgespür','Klingentänzer'],weaponIni:-1});
eq([ini.fixed,ini.dice],[15,'2W6'],'initiative SF + weapon + Klingentänzer');
eq(heroCombat.offhandPenalty({specialAbilities:['Linkhand']}),6,'offhand Linkhand');eq(heroCombat.offhandPenalty({specialAbilities:['Beidhändiger Kampf I']}),3,'offhand BHK I');eq(heroCombat.offhandPenalty({specialAbilities:['Beidhändiger Kampf II']}),0,'offhand BHK II');
eq(heroCombat.dualPairModifier({rightBase:'A',leftBase:'B',rightTalent:'Schwerter',leftTalent:'Schwerter'}),{at:-1,pa:-1,note:'verschiedene Waffen, gleiches Talent'},'dual same talent penalty');
let melee=heroCombat.meleeValues({baseAt:15,basePa:14,ebe:3,specialized:true,wm:[1,-1],shieldWmAt:-1,tp:[1,6,2],tpkk:[11,4],kk:15});
eq([melee.at,melee.pa,melee.tp],[15,12,[1,6,3]],'melee derived values');
eq(heroCombat.rangedValue({fkBase:8,talentValue:10,ebe:2,specialized:true}),18,'ranged specialization');
eq(heroCombat.shieldParry({paBase:8,wmPa:2,weaponPA:18,specialAbilities:['Linkhand','Schildkampf I','Schildkampf II']}),17,'shield PA');
eq(heroCombat.shieldParry({parryWeapon:true,mainPA:14,wmPa:1,specialAbilities:['Parierwaffen II']}),17,'parry weapon II');

// WdS wound thresholds: KO/2, KO, 1.5*KO with commercial rounding; trait/attack modifiers apply to all.
eq(wounds.woundThresholds({ko:13}),[7,13,20],'KO 13 wound thresholds');
eq(wounds.woundThresholds({ko:13,eisern:true}),[9,15,22],'Eisern +2 each wound threshold');
eq(wounds.woundThresholds({ko:13,attackModifier:-2}),[5,11,18],'attack lowers all wound thresholds');
eq(wounds.woundsFromDamage(13,{ko:13}).wounds,1,'damage equal KO does not cross second threshold');
eq(wounds.woundsFromDamage(14,{ko:13}).wounds,2,'damage above KO causes two wounds');
eq(wounds.woundsFromDamage(21,{ko:13}).wounds,3,'damage above 1.5 KO causes three wounds');
eq(wounds.woundModifiers({wounds:3,ignoredWounds:1}),{activeWounds:2,at:-4,pa:-4,fk:-4,iniBase:-4,ge:-4,gs:-2},'wound modifiers');
eq(wounds.woundIgnoreDifficulty(3),12,'ignore three wounds difficulty');
eq(wounds.woundHitEffects(3).auLossDice,[1,6,0],'one wound-producing hit causes one W6 AuP loss');

// WdS optional low LE/AU tiers and cumulative modifiers.
eq(conditions.lowLifeEffects({current:19,max:40}).check3Difficulty,3,'LE below half');
eq(conditions.lowLifeEffects({current:13,max:40}).check3Difficulty,6,'LE below third');
eq(conditions.lowLifeEffects({current:9,max:40}).check3Difficulty,9,'LE below quarter');
ok(conditions.lowLifeEffects({current:5,max:40}).incapacitated,'LE 5 normally incapacitated');ok(!conditions.lowLifeEffects({current:5,max:40,canActBelow5:true}).incapacitated,'Eisern-like capability can act below 6 LE');
eq(conditions.lowStaminaEffects({current:12,max:40}).check3Difficulty,3,'AU below third');
eq(conditions.lowStaminaEffects({current:9,max:40}).check3Difficulty,6,'AU below quarter');ok(conditions.lowStaminaEffects({current:0,max:40}).incapacitated,'AU zero incapacitated');
let combined=conditions.combinedConditionEffects({life:{current:19,max:40},stamina:{current:12,max:40}});eq([combined.propertyDifficulty,combined.combatDifficulty,combined.check3Difficulty],[2,2,6],'LE/AU penalties stack');

// WdS maneuvers, with Geano active-sf.js used only as workflow reference.
let ws=maneuvers.wuchtschlag({announcement:5,taw:12,at:16,hasSf:false,weaponTalent:'Schwerter'});eq([ws.attackDifficulty,ws.damageBonus],[5,3],'Wuchtschlag without SF uses half announcement rounded up');
ws=maneuvers.wuchtschlag({announcement:5,taw:12,at:16,hasSf:true,weaponTalent:'Schwerter'});eq(ws.damageBonus,5,'Wuchtschlag SF uses full announcement');
let finte=maneuvers.finte({announcement:5,taw:12,at:16,hasSf:false,be:3,weaponTalent:'Schwerter'});eq([finte.attackDifficulty,finte.defenseDifficulty],[5,3],'Finte without SF halves defense penalty');
finte=maneuvers.finte({announcement:5,taw:12,at:16,hasSf:true,be:3,shield:true,weaponTalent:'Schwerter'});eq([finte.attackDifficulty,finte.defenseDifficulty,finte.shieldDifficulty],[7,5,2],'Finte SF with shield mobility penalty');
ok(!maneuvers.finte({announcement:2,taw:12,at:16,hasSf:true,be:5,weaponTalent:'Schwerter'}).allowed,'Finte blocked above BE 4');
ok(!maneuvers.finte({announcement:2,taw:12,at:16,hasSf:true,be:0,weaponTalent:'Kettenwaffen'}).allowed,'Finte blocked for excluded talent');
let split=maneuvers.splitWuchtschlagFinte({damageAnnouncement:3,defenseAnnouncement:4,taw:12,at:16,hasWuchtschlag:true,hasFinte:true,weaponTalent:'Schwerter'});eq([split.attackDifficulty,split.damageBonus,split.defenseDifficulty],[7,3,4],'combined Wuchtschlag + Finte split');
throws(()=>maneuvers.wuchtschlag({announcement:13,taw:12,at:16,weaponTalent:'Schwerter'}),'announcement may not exceed TaW');

// WdZ magic cost/attempt rules.
eq(magic.spellCost({plannedCost:5,success:true}).cost,5,'successful spell pays full cost');
eq(magic.spellCost({plannedCost:5,success:false}).cost,3,'failed normal spell pays rounded half');
eq(magic.spellCost({plannedCost:5,success:false,representation:'Satuarisch'}).cost,2,'failed satuarian spell pays rounded third');
eq(magic.repeatFailureModifier({failedAttempts:2}),6,'repeat failed spell +3 per prior failure');
eq(magic.repeatFailureModifier({failedAttempts:2,hasZauberroutine:true}),0,'Zauberroutine suppresses repeat penalty');
eq([magic.forceSpellEffectCost(1),magic.forceSpellEffectCost(2),magic.forceSpellEffectCost(3),magic.forceSpellEffectCost(4)],[1,2,4,8],'Erzwingen AsP progression');

console.log('AP19.1b DSA 4.1 coverage regression tests passed');
