import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const talent=require('../js/dsa41/talent-core.js');
const providerApi=require('../js/bridge-heldenmobil-provider.js');
const contract=require('../js/bridge-contract-v1.js');
const {ORDINARY_TALENTS:catalog,TALENT_TYPE,TALENT_GROUP,RESOLUTION_MODE,AVAILABILITY}=talent;

// Independent inventory from WdS pp. 193–195, with the full name from p. 27
// for Brett-/Kartenspiel. This must detect omissions, extras and wrong groups.
const expectedGroups={
  physical:'Akrobatik|Athletik|Fliegen|Gaukeleien|Klettern|Körperbeherrschung|Reiten|Schleichen|Schwimmen|Selbstbeherrschung|Sich Verstecken|Singen|Sinnenschärfe|Skifahren|Stimmen Imitieren|Tanzen|Taschendiebstahl|Zechen',
  social:'Betören|Etikette|Gassenwissen|Lehren|Menschenkenntnis|Schauspielerei|Schriftlicher Ausdruck|Sich Verkleiden|Überreden|Überzeugen',
  nature:'Fährtensuchen|Fallenstellen|Fesseln/Entfesseln|Fischen/Angeln|Orientierung|Wettervorhersage|Wildnisleben',
  knowledge:'Anatomie|Baukunst|Brett-/Kartenspiel|Geographie|Geschichtswissen|Gesteinskunde|Götter/Kulte|Heraldik|Hüttenkunde|Kriegskunst|Kryptographie|Magiekunde|Mechanik|Pflanzenkunde|Philosophie|Rechnen|Rechtskunde|Sagen/Legenden|Schätzen|Sprachenkunde|Staatskunst|Sternkunde|Tierkunde',
  craft:'Abrichten|Ackerbau|Alchimie|Bergbau|Bogenbau|Boote Fahren|Brauer|Drucker|Fahrzeug Lenken|Falschspiel|Feinmechanik|Feuersteinbearbeitung|Fleischer|Gerber/Kürschner|Glaskunst|Grobschmied|Handel|Hauswirtschaft|Heilkunde Gift|Heilkunde Krankheiten|Heilkunde Seele|Heilkunde Wunden|Holzbearbeitung|Instrumentenbauer|Kartographie|Kochen|Kristallzucht|Lederarbeiten|Malen/Zeichnen|Maurer|Metallguss|Musizieren|Schlösser Knacken|Schnaps Brennen|Schneidern|Seefahrt|Seiler|Steinmetz|Steinschneider/Juwelier|Stellmacher|Stoffe Färben|Tätowieren|Töpfern|Viehzucht|Webkunst|Winzer|Zimmermann'
};
const basics=new Set(('Athletik|Klettern|Körperbeherrschung|Schleichen|Schwimmen|Selbstbeherrschung|Sich Verstecken|Singen|Sinnenschärfe|Tanzen|Zechen|Menschenkenntnis|Überreden|Fährtensuchen|Orientierung|Wildnisleben|Götter/Kulte|Rechnen|Sagen/Legenden|Heilkunde Wunden|Holzbearbeitung|Kochen|Lederarbeiten|Malen/Zeichnen|Schneidern').split('|'));
assert.equal(catalog.length,105);
assert.equal(basics.size,25);
assert.equal(talent.CORE_TALENTS,catalog,'CORE_TALENTS is the same frozen catalog');
assert.deepEqual(Object.values(TALENT_GROUP).sort(),Object.keys(expectedGroups).sort());
assert.deepEqual(RESOLUTION_MODE,{TALENT:'TALENT',PROFICIENCY:'PROFICIENCY',COMBAT:'COMBAT'});
for(const [group,names] of Object.entries(expectedGroups)){
  assert.deepEqual(catalog.filter(def=>def.group===group).map(def=>def.name).sort(),names.split('|').sort(),`${group}: complete WdS inventory`);
}

const attributeKeys=new Set(['MU','KL','IN','CH','FF','GE','KO','KK']);
const labels=new Map();
const attributes={MU:12,KL:12,IN:12,CH:12,FF:12,GE:12,KO:12,KK:12};
const fixedRules={
  Akrobatik:'BE*2',Athletik:'BE*2',Fliegen:'BE',Gaukeleien:'BE*2',Klettern:'BE*2',
  Körperbeherrschung:'BE*2',Reiten:'BE-2',Schleichen:'BE',Schwimmen:'BE*2',
  'Sich Verstecken':'BE-2',Singen:'BE-3',Skifahren:'BE-2','Stimmen Imitieren':'BE-4',
  Tanzen:'BE*2',Taschendiebstahl:'BE*2',Betören:'BE-2',Etikette:'BE-2',Gassenwissen:'BE-4'
};
for(const def of catalog){
  assert.equal(def.resolutionMode,'TALENT',`${def.name}: ordinary resolution only`);
  assert.equal(def.type,basics.has(def.name)?TALENT_TYPE.BASIC:TALENT_TYPE.SPECIAL,`${def.name}: WdS classification`);
  assert.equal(def.defaultAttributes.length,3,def.name);
  assert.ok(def.defaultAttributes.every(key=>attributeKeys.has(key)),`${def.name}: valid property triple`);
  assert.equal(def.encumbranceRule,fixedRules[def.name]??null,`${def.name}: fixed eBE`);
  for(const label of [def.name,...def.aliases]){
    const normalized=label.trim().toLocaleLowerCase('de-DE');
    assert.ok(normalized,`${def.name}: nonempty name/alias`);
    assert.ok(!labels.has(normalized),`${label}: duplicate name/alias with ${labels.get(normalized)}`);
    labels.set(normalized,def.name);
    assert.equal(talent.getTalentDefinition(` ${label.toUpperCase()} `),def,'case/outer whitespace normalization');
    assert.ok(talent.sameTalentName(label,def.name),'alias equivalence');
    const hld={name:label,value:4};
    assert.equal(talent.findHeroTalent([hld],def.name),hld,'canonical request matches HLD alias');
  }
  for(const rule of [def.encumbranceRule,...def.encumbranceVariants.map(v=>v.rule)]){
    for(const be of [0,3,6]){
      const penalty=talent.encumbrancePenalty(rule,be);
      assert.ok(Number.isFinite(penalty)&&penalty>=0,`${def.name}: parseable eBE ${rule}`);
    }
  }
  const substituteNames=new Set();
  for(const sub of def.substitutes){
    const target=talent.getTalentDefinition(sub.talent);
    assert.ok(target,`${def.name}: known E1 substitute ${sub.talent}`);
    assert.equal(target.name,sub.talent,'substitutes use canonical names');
    assert.equal(target.resolutionMode,'TALENT');
    assert.notEqual(target,def,'no self substitution');
    assert.ok(!substituteNames.has(sub.talent),'no duplicate substitute');
    substituteNames.add(sub.talent);
    if(sub.penalty===null)assert.ok(sub.condition,'unspecified penalty must be explained');
    else assert.ok(Number.isFinite(sub.penalty)&&sub.penalty>=0,'valid substitution penalty');
    if('specialization' in sub)assert.ok(sub.specialization.trim(),'nonempty specialization requirement');
  }
  // Every activated ordinary talent can resolve without any advancement prerequisite.
  // No HLD probe: the registry must supply the correct three attributes.
  const resolved=talent.resolveTalentCheck({talent:{name:def.name,value:8},heroAttributes:attributes,rolls:[6,7,8]});
  assert.deepEqual(resolved.attributeKeys,def.defaultAttributes);
  assert.equal(resolved.result.success,true);
  assert.equal(resolved.result.points,8);
}
assert.deepEqual(catalog.filter(def=>def.substitutes.some(s=>s.penalty===null)).map(def=>def.name),['Kriegskunst']);
for(const [rule,expected] of [[null,0],['BE',6],['BE*2',12],['BE-2',4],['BE-3',3],['BE-4',2]]){
  assert.equal(talent.encumbrancePenalty(rule,6),expected);
}
assert.equal(talent.encumbrancePenalty('BE-4',1),0);
const persuasion=talent.getTalentDefinition('Überreden');
assert.equal(persuasion.encumbranceRule,null,'Überreden has no automatic catalog eBE');
assert.deepEqual(persuasion.encumbranceVariants,[],'Überreden has no automatic eBE variants');
assert.throws(()=>talent.encumbrancePenalty('situationsabhängig',3),/unsupported encumbrance/);

// Catalog and nested metadata must not be mutable by an integration caller.
function deeplyFrozen(value){
  if(!value||typeof value!=='object')return;
  assert.ok(Object.isFrozen(value));
  for(const child of Object.values(value))deeplyFrozen(child);
}
deeplyFrozen(catalog);

// Source details that differ from the compressed overview / common misclassifications.
assert.deepEqual(talent.getTalentDefinition('Feuersteinbearbeitung').defaultAttributes,['KL','FF','FF'],'WdS p.35 corrects overview LK typo');
assert.deepEqual(talent.getTalentDefinition('Fährtensuchen').defaultAttributes,['KL','IN','KO'],'retain established long-track default');
assert.deepEqual(talent.getTalentDefinition('Stellmacher').substitutes,[{talent:'Zimmermann',penalty:10}],'WdS p.40, omitted by overview');
assert.equal(talent.getTalentDefinition('Sprachenkunde').group,TALENT_GROUP.KNOWLEDGE,'linguistics is an ordinary knowledge talent');
assert.equal(talent.getTalentDefinition('Brettspiel').name,'Brett-/Kartenspiel');
assert.equal(talent.getTalentDefinition('Kristallzüchter').name,'Kristallzucht');
assert.equal(talent.getTalentDefinition('Heilkunde: Krankheiten').name,'Heilkunde Krankheiten');
assert.deepEqual(talent.getTalentDefinition('Stimmen Imitieren').substitutes,[{talent:'Gaukeleien',penalty:5,specialization:'Bauchreden'}]);
assert.deepEqual(talent.getTalentDefinition('Alchimie').substitutes[0],{talent:'Kochen',penalty:10,specialization:'Tränke'});

// Full provider path, including zero dice consumed for unavailable talents.
const hero={key:'e1-hero',name:'E1 Testheld',props:Object.entries(providerApi.SHORT_TO_FULL).map(([key,name])=>({name,value:attributes[key],mod:0})),talents:[]};
let diceUsed=0;
const provider=providerApi.createProvider({getHeroes:()=>[hero],getCombatState:()=>({be:0}),rollDie:()=>{diceUsed++;return 8;}});
const request=(name,{context={},mode='standard',modifier=0}={})=>contract.checkRequestV1({
  requestId:'e1-check',heroId:hero.key,check:{kind:'talent',key:name,mode},modifier,
  context:{...context,talent:{ruleProfile:'dsa41-v1',...(context.talent||{})}}
});
for(const def of catalog){
  hero.talents=[];
  let before=diceUsed;
  let result=provider.executeCheck(request(def.name));
  assert.equal(result.status,'unsupported');
  assert.equal(result.outcome,basics.has(def.name)?'basic-talent-value-unavailable':'special-talent-unactivated',def.name);
  assert.equal(diceUsed,before,'no dice for absent talent');

  hero.talents=[{name:def.name,value:-2,specs:['Test']}];
  result=provider.executeCheck(request(def.name));
  if(basics.has(def.name)){
    assert.equal(talent.talentAvailability({name:def.name,heroTalents:hero.talents}).status,AVAILABILITY.AVAILABLE);
    assert.equal(result.status,'resolved',`${def.name}: negative BASIC is allowed`);
    assert.equal(result.success,true);
    assert.equal(result.effectiveValue,-2);
    assert.deepEqual(result.targets,[10,10,10]);
    assert.equal(result.qualityPoints,1);
    assert.equal(diceUsed,before+3);
  }else{
    assert.equal(result.outcome,'special-talent-negative',`${def.name}: negative SPECIAL is blocked`);
    assert.equal(diceUsed,before,'no dice for negative special');
    assert.throws(()=>talent.resolveTalentCheck({talent:hero.talents[0],heroAttributes:attributes,rolls:[1,1,1],specialization:'Test'}),/special talent cannot/,'even critical dice/spec bonus cannot activate a negative special');
  }
}

// The existing numeric request modifier is a universal TALENT invariant.
// Positive values are difficulty; negative values are relief. With BE=0 it must
// not change attributes or any catalog/activation semantics, and relief remains
// capped at the real TaW for TaP*.
for(const def of catalog){
  hero.talents=[{name:def.name,value:8,specs:[]}];
  let before=diceUsed;
  let hard=provider.executeCheck(request(def.name,{modifier:3}));
  assert.deepEqual([hard.status,hard.meta.externalModifier,hard.meta.totalModifier,hard.effectiveValue,hard.qualityPoints],['resolved',3,3,5,5],`${def.name}: +3 manual difficulty`);
  assert.deepEqual(hard.meta.usedAttributes,def.defaultAttributes,`${def.name}: modifier must not change attributes`);
  assert.equal(diceUsed,before+3);
  before=diceUsed;
  const easy=provider.executeCheck(request(def.name,{modifier:-3}));
  assert.deepEqual([easy.status,easy.meta.externalModifier,easy.meta.totalModifier,easy.effectiveValue,easy.qualityPoints],['resolved',-3,-3,11,8],`${def.name}: -3 manual relief keeps TaP* capped at TaW`);
  assert.deepEqual(easy.meta.usedAttributes,def.defaultAttributes,`${def.name}: relief must not change attributes`);
  assert.equal(diceUsed,before+3);
}
hero.talents=[];
let blockedByActivation=provider.executeCheck(request('Reiten',{modifier:-3}));
assert.equal(blockedByActivation.outcome,'special-talent-unactivated','manual relief never activates a special talent');

// Representative complete bridge results from all five groups, including canonical
// aliases and no HLD probe. High TaW alone must not require advancement prerequisites.
for(const [name,expectedAttributes] of [
  ['Athletik',['GE','KO','KK']],['Reiten',['CH','GE','KK']],
  ['Menschenkenntnis',['KL','IN','CH']],['Schriftlicher Ausdruck',['KL','IN','IN']],
  ['Fallen stellen',['KL','FF','KK']],['Wildnisleben',['IN','GE','KO']],
  ['Brettspiel',['KL','KL','IN']],['Sprachenkunde',['KL','KL','IN']],
  ['Alchimie',['MU','KL','FF']],['Heilkunde: Wunden',['KL','CH','FF']]
]){
  hero.talents=[{name,value:15}];
  const before=diceUsed;
  const result=provider.executeCheck(request(name));
  assert.deepEqual([result.status,result.success,result.qualityPoints,result.meta.usedAttributes],['resolved',true,15,expectedAttributes],name);
  assert.equal(diceUsed,before+3);
}

hero.talents=[{name:'Singen',probe:'IN/CH/KO',value:5,be:'-'}];
let result=provider.executeCheck(request('Singen',{context:{advisoryAttributes:['MU','GE','KK']}}));
assert.deepEqual(result.meta.usedAttributes,['IN','CH','KO'],'HLD probe beats default and advisory attributes');
result=provider.executeCheck(request('Singen',{context:{talent:{attributeOverride:['KL','IN','FF']}}}));
assert.deepEqual(result.meta.usedAttributes,['KL','IN','FF'],'only explicit context overrides HLD');
const beforeInvalid=diceUsed;
result=provider.executeCheck(request('Singen',{context:{talent:{attributeOverride:['XX','IN','FF']}}}));
assert.equal(result.outcome,'talent-context-invalid');
assert.equal(diceUsed,beforeInvalid,'invalid explicit override never falls back or rolls');

const armorProvider=providerApi.createProvider({getHeroes:()=>[hero],getCombatState:()=>({be:3}),rollDie:()=>8});
hero.talents=[{name:'Schwimmen',value:8}];
result=armorProvider.executeCheck(request('Schwimmen',{modifier:1}));
assert.deepEqual([result.meta.encumbrancePenalty,result.meta.externalModifier,result.meta.totalModifier,result.effectiveValue],[6,1,7,1],'registry eBE composes with explicit modifier');
hero.talents[0].be='-';
assert.equal(armorProvider.executeCheck(request('Schwimmen')).meta.encumbrancePenalty,0,'explicit HLD eBE remains authoritative');
hero.talents=[{name:'Überreden',value:8,specs:['Betteln']}];
result=armorProvider.executeCheck(request('Überreden',{modifier:3,context:{talent:{specialization:'Betteln'}}}));
assert.deepEqual([result.meta.encumbrancePenalty,result.meta.externalModifier,result.meta.totalModifier,result.meta.specializationBonus,result.effectiveValue],[0,3,3,2,7],'Überreden has no automatic eBE; request modifier composes without changing specialization');

// Reporting substitutes does not authorize, activate or select any of them.
hero.talents=[{name:'Gaukeleien',value:12,specs:[]}];
const beforeSubstitute=diceUsed;
result=provider.executeCheck(request('Stimmen Imitieren'));
assert.equal(result.outcome,'special-talent-unactivated');
assert.deepEqual(result.meta.substitutions,[{talent:'Gaukeleien',penalty:5,specialization:'Bauchreden'}],'specialization requirement survives provider projection');
hero.talents[0].specs=['Bauchreden'];
result=provider.executeCheck(request('Stimmen Imitieren'));
assert.equal(result.outcome,'special-talent-unactivated');
assert.equal(diceUsed,beforeSubstitute,'even a qualified substitute is never auto-rolled');
hero.talents=[{name:'Kochen',value:9,specs:['Tränke']}];
result=provider.executeCheck(request('Alchimie'));
assert.deepEqual(result.meta.substitutions,[{talent:'Kochen',penalty:10,specialization:'Tränke'}]);
assert.equal(result.outcome,'special-talent-unactivated');
hero.talents=[{name:'Rechnen',value:12}];
result=provider.executeCheck(request('Kriegskunst'));
assert.equal(result.meta.substitutions[0].penalty,null,'unspecified source penalty stays unknown, not zero');
assert.ok(result.meta.substitutions[0].condition);
assert.equal(diceUsed,beforeSubstitute);
hero.talents=[{name:'Kochen',value:5},{name:'Fleischer',value:20}];
result=provider.executeCheck(request('Kochen'));
assert.deepEqual([result.meta.baseTaW,result.meta.totalModifier,result.qualityPoints],[5,0,5],'available higher substitute never affects the requested check');

// Reserved modes cannot accidentally enter the ordinary resolver via a custom catalog.
for(const mode of ['PROFICIENCY','COMBAT','EXTENDED']){
  assert.throws(()=>talent.resolveTalentCheck({
    talent:{name:'Reserved',probe:'KL/IN/FF',value:5},heroAttributes:attributes,rolls:[8,8,8],
    catalog:[{name:'Reserved',type:TALENT_TYPE.SPECIAL,resolutionMode:mode}]
  }),/unsupported talent resolution mode/);
}
for(const name of ['Sprachen Kennen Garethi','Sprachen Kennen [Muttersprache]','Lesen/Schreiben Kusliker Zeichen','Schwerter','Bogen','Ringen','Prophezeien','Unbekannt']){
  assert.equal(talent.getTalentDefinition(name),null,'out of E1 catalog');
  hero.talents=[{name,probe:'KL/IN/CH',value:12}];
  const before=diceUsed;
  assert.equal(provider.executeCheck(request(name)).outcome,'talent-definition-unavailable','no legacy fallback for unmodelled profile talent');
  assert.equal(diceUsed,before);
}
hero.talents=[{name:'Kochen',value:5}];
for(const mode of ['EXTENDED','extended']){
  const before=diceUsed;
  result=provider.executeCheck(request('Kochen',{mode}));
  assert.deepEqual([result.status,result.outcome,result.rolls],['unsupported','talent-check-mode-unsupported',[]]);
  assert.equal(diceUsed,before,'no extended check path or accumulated dice');
}
assert.throws(()=>contract.checkRequestV1({requestId:'e1-extended',heroId:hero.key,check:{kind:'EXTENDED',key:'Kochen'}}),/unsupported check kind/);
assert.ok(!Object.keys(talent).some(key=>/extended/i.test(key)),'no accumulated-check API');

// Preserve the pre-E1 custom catalog contract when resolutionMode is absent.
const legacyCatalog=[{name:'Custom',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','KL','IN'],substitutes:[]}];
assert.equal(talent.resolveTalentCheck({talent:{name:'Custom',value:4},heroAttributes:attributes,catalog:legacyCatalog,rolls:[8,8,8]}).result.success,true);

// Real browser export path: no Node-only catalog dependency or extra script order.
const browser=vm.createContext({});
for(const file of ['check-core.js','talent-core.js']){
  vm.runInContext(fs.readFileSync(new URL(`../js/dsa41/${file}`,import.meta.url),'utf8'),browser,{filename:file});
}
assert.equal(browser.HeldenMobilDsa41Talent.CORE_TALENTS,browser.HeldenMobilDsa41Talent.ORDINARY_TALENTS);
assert.equal(browser.HeldenMobilDsa41Talent.ORDINARY_TALENTS.length,105);
assert.equal(browser.HeldenMobilDsa41Talent.resolveTalentCheck({talent:{name:'Kochen',value:5},heroAttributes:attributes,rolls:[8,8,8]}).result.points,5);

console.log('TALENT-E1 passed: 105 talents / 5 groups / 25 BASIC / 80 SPECIAL; catalog, provider and browser regressions');

