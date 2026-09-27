(function(root,factory){
  const checks=typeof module==='object'&&module.exports?require('./check-core.js'):root.HeldenMobilDsa41Check;
  const api=factory(checks);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Talent=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(checks){
  'use strict';
  if(!checks)throw new Error('check core is required');

  const TALENT_TYPE=Object.freeze({BASIC:'basic',SPECIAL:'special'});
  const AVAILABILITY=Object.freeze({AVAILABLE:'available',UNACTIVATED_SPECIAL:'unactivated-special',SPECIAL_VALUE_NEGATIVE:'special-value-negative',BASIC_VALUE_MISSING:'basic-value-missing',UNKNOWN_TALENT:'unknown-talent'});
  const ATTRIBUTES=new Set(['MU','KL','IN','CH','FF','GE','KO','KK']);

  const n=(value,label)=>{const out=Number(value);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;};
  const norm=(value)=>String(value??'').trim().toLocaleLowerCase('de-DE');
  const list=(value)=>Array.isArray(value)?value:[];
  function attributeTriplet(values,label='attributes'){
    if(!Array.isArray(values)||values.length!==3)throw new TypeError(`${label} must contain exactly three attribute keys`);
    return values.map((value,index)=>{const key=String(value||'').trim().toUpperCase();if(!ATTRIBUTES.has(key))throw new RangeError(`${label}[${index}] is not a DSA attribute key`);return key;});
  }
  function probeAttributeKeys(probe){
    const keys=(String(probe||'').toUpperCase().match(/MU|KL|IN|CH|FF|GE|KO|KK/g)||[]).slice(0,3);
    return keys.length===3?keys:[];
  }
  function freezeDefinition(def){
    return Object.freeze({
      name:String(def.name),aliases:Object.freeze([...(def.aliases||[])]),type:def.type,
      defaultAttributes:Object.freeze([...(def.defaultAttributes||[])]),encumbranceRule:def.encumbranceRule??null,
      substitutes:Object.freeze((def.substitutes||[]).map(x=>Object.freeze({talent:String(x.talent),penalty:Number(x.penalty)})))
    });
  }

  // TALENT-A intentionally contains only the core exploration slice needed to prove
  // catalogue semantics. The full WdS catalogue remains TALENT-E scope.
  const CORE_TALENTS=Object.freeze([
    freezeDefinition({name:'Sinnensch\u00e4rfe',aliases:['Sinnessch\u00e4rfe'],type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','IN']}),
    freezeDefinition({name:'Klettern',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','GE','KK'],encumbranceRule:'BE*2',substitutes:[{talent:'Akrobatik',penalty:5},{talent:'Athletik',penalty:5},{talent:'K\u00f6rperbeherrschung',penalty:10}]}),
    freezeDefinition({name:'K\u00f6rperbeherrschung',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE*2',substitutes:[{talent:'Akrobatik',penalty:5},{talent:'Athletik',penalty:10}]}),
    freezeDefinition({name:'Schleichen',type:TALENT_TYPE.BASIC,defaultAttributes:['MU','IN','GE'],encumbranceRule:'BE'}),
    freezeDefinition({name:'F\u00e4hrtensuchen',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','KO']}),
    freezeDefinition({name:'Orientierung',type:TALENT_TYPE.BASIC,defaultAttributes:['KL','IN','IN'],substitutes:[{talent:'Sternkunde',penalty:10}]}),
    freezeDefinition({name:'Mechanik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','KL','FF']}),
    freezeDefinition({name:'Feinmechanik',type:TALENT_TYPE.SPECIAL,defaultAttributes:['KL','FF','FF']}),
    freezeDefinition({name:'Schl\u00f6sser Knacken',type:TALENT_TYPE.SPECIAL,defaultAttributes:['IN','FF','FF'],substitutes:[{talent:'Feinmechanik',penalty:5}]})
  ]);

  function getTalentDefinition(name,catalog=CORE_TALENTS){
    const wanted=norm(name);
    return list(catalog).find(def=>norm(def.name)===wanted||list(def.aliases).some(alias=>norm(alias)===wanted))||null;
  }
  function sameTalentName(left,right,catalog=CORE_TALENTS){
    if(norm(left)===norm(right))return true;
    const leftDef=getTalentDefinition(left,catalog),rightDef=getTalentDefinition(right,catalog);
    return !!(leftDef&&rightDef&&norm(leftDef.name)===norm(rightDef.name));
  }
  function findHeroTalent(heroTalents,name,catalog=CORE_TALENTS){return list(heroTalents).find(t=>sameTalentName(t?.name,name,catalog))||null;}
  function talentAvailability({name,heroTalents=[],catalog=CORE_TALENTS}={}){
    const definition=getTalentDefinition(name,catalog),talent=findHeroTalent(heroTalents,name,catalog);
    if(talent&&definition?.type===TALENT_TYPE.SPECIAL&&n(talent.value??0,'talent value')<0)return {status:AVAILABILITY.SPECIAL_VALUE_NEGATIVE,definition,talent};
    if(talent)return {status:AVAILABILITY.AVAILABLE,definition,talent};
    if(!definition)return {status:AVAILABILITY.UNKNOWN_TALENT,definition:null,talent:null};
    if(definition.type===TALENT_TYPE.SPECIAL)return {status:AVAILABILITY.UNACTIVATED_SPECIAL,definition,talent:null};
    return {status:AVAILABILITY.BASIC_VALUE_MISSING,definition,talent:null};
  }
  function substitutionOptions({name,heroTalents=[],catalog=CORE_TALENTS}={}){
    const definition=getTalentDefinition(name,catalog);if(!definition)return[];
    return definition.substitutes.map(sub=>({definition:sub,talent:findHeroTalent(heroTalents,sub.talent,catalog)})).filter(x=>x.talent).map(x=>({kind:'substitute',requestedTalent:definition.name,talent:x.talent,penalty:x.definition.penalty}));
  }
  function encumbrancePenalty(rule,be=0){
    const base=Math.max(0,n(be,'BE')),text=String(rule??'').trim().toUpperCase().replace(/\s+/g,'').replace(/\u00d7/g,'X');
    if(!text||text==='-'||text==='0'||text==='KEINE')return 0;
    if(text==='BE')return base;
    let match=text.match(/^BE(?:X|\*)(\d+(?:[.,]\d+)?)$/);if(match)return base*Number(match[1].replace(',','.'));
    match=text.match(/^(\d+(?:[.,]\d+)?)(?:X|\*)BE$/);if(match)return base*Number(match[1].replace(',','.'));
    match=text.match(/^BE-(\d+(?:[.,]\d+)?)$/);if(match)return Math.max(0,base-Number(match[1].replace(',','.')));
    match=text.match(/^BE\+(\d+(?:[.,]\d+)?)$/);if(match)return base+Number(match[1].replace(',','.'));
    if(/^\d+(?:[.,]\d+)?$/.test(text))return Number(text.replace(',','.'));
    throw new RangeError(`unsupported encumbrance rule: ${rule}`);
  }
  function specializationBonus(talent,requestedSpecialization){
    const wanted=norm(requestedSpecialization);if(!wanted)return 0;
    return list(talent?.specs).some(spec=>norm(spec)===wanted)?2:0;
  }
  function resolveAttributeKeys({talent,definition=null,override=null}={}){
    if(override!=null)return attributeTriplet(override,'attribute override');
    const fromTalent=probeAttributeKeys(talent?.probe);if(fromTalent.length===3)return fromTalent;
    const fromDefinition=definition?.defaultAttributes||[];return attributeTriplet(fromDefinition,'default attributes');
  }
  function attributeValues(attributes,keys){
    if(!attributes||typeof attributes!=='object')throw new TypeError('hero attributes are required');
    return keys.map(key=>n(attributes[key],`attribute ${key}`));
  }
  function resolveTalentCheck({talent,heroAttributes,modifier=0,be=0,attributeOverride=null,specialization=null,rolls,catalog=CORE_TALENTS}={}){
    if(!talent||typeof talent!=='object')throw new TypeError('activated talent record is required');
    const definition=getTalentDefinition(talent.name,catalog),attributeKeys=resolveAttributeKeys({talent,definition,override:attributeOverride});
    const baseSkill=n(talent.value??0,'talent value');
    if(definition?.type===TALENT_TYPE.SPECIAL&&baseSkill<0)throw new RangeError(`special talent cannot be checked with negative TaW: ${definition.name}`);
    const specBonus=specializationBonus(talent,specialization),skill=baseSkill+specBonus;
    const rule=String(talent.be??'').trim()||(definition?.encumbranceRule??null),ebe=encumbrancePenalty(rule,be),externalModifier=n(modifier,'modifier'),totalModifier=externalModifier+ebe;
    const result=checks.checkTalent({values:attributeValues(heroAttributes,attributeKeys),skill,modifier:totalModifier,rolls});
    return {definition,attributeKeys,baseSkill,specializationBonus:specBonus,skill,encumbranceRule:rule,encumbrancePenalty:ebe,externalModifier,totalModifier,result};
  }

  return {TALENT_TYPE,AVAILABILITY,CORE_TALENTS,getTalentDefinition,sameTalentName,findHeroTalent,talentAvailability,substitutionOptions,probeAttributeKeys,resolveAttributeKeys,encumbrancePenalty,specializationBonus,resolveTalentCheck};
});
