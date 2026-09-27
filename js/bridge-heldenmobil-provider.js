(function(root,factory){
  const contract=typeof module==='object'&&module.exports?require('./bridge-contract-v1.js'):root.HeldenMobilBridgeContractV1;
  const checks=typeof module==='object'&&module.exports?require('./dsa41/check-core.js'):root.HeldenMobilDsa41Check;
  const magic=typeof module==='object'&&module.exports?require('./dsa41/magic-core.js'):root.HeldenMobilDsa41Magic;
  const talents=typeof module==='object'&&module.exports?require('./dsa41/talent-core.js'):root.HeldenMobilDsa41Talent;
  const api=factory(contract,checks,magic,talents);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilBridgeProviderV1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(contract,checks,magic,talents){
  'use strict';
  if(!contract||!checks||!magic||!talents)throw new Error('bridge contract, check core, magic core and talent core are required');

  const TALENT_RULE_PROFILE='dsa41-v1';
  const TALENT_CONTEXT_CAPABILITY='check:talent-context:v1';
  const SHORT_TO_FULL=Object.freeze({MU:'Mut',KL:'Klugheit',IN:'Intuition',CH:'Charisma',FF:'Fingerfertigkeit',GE:'Gewandtheit',KO:'Konstitution',KK:'Körperkraft'});
  const FULL_TO_SHORT=Object.freeze(Object.fromEntries(Object.entries(SHORT_TO_FULL).map(([short,full])=>[full,short])));

  function text(value,label){const out=String(value??'').trim();if(!out)throw new TypeError(`${label} must be a non-empty string`);return out;}
  function finite(value,label){const out=Number(value);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;}
  function array(value,label){if(!Array.isArray(value))throw new TypeError(`${label} must be an array`);return value;}
  function plain(value){return !!value&&typeof value==='object'&&!Array.isArray(value);}
  function heroId(hero){return text(hero?.key??hero?.heroId,'hero key');}
  function propMap(hero){return new Map(array(hero?.props||[],'hero.props').map(item=>[String(item?.name||''),item]));}
  function propertyValue(hero,fullName){const prop=propMap(hero).get(fullName);return prop?finite(prop.value??0,fullName)+finite(prop.mod??0,`${fullName}.mod`):0;}
  function shortValue(hero,shortName){const full=SHORT_TO_FULL[shortName]||shortName;return propertyValue(hero,full);}
  function probeShortNames(probe=''){return (String(probe).toUpperCase().match(/MU|KL|IN|CH|FF|GE|KO|KK/g)||[]).slice(0,3);}
  function abilityProbe(ability){const attrs=probeShortNames(ability?.probe);return attrs.length===3?attrs:[];}
  function normalizedTalent(talent){return {key:text(talent.name,'talent name'),name:text(talent.name,'talent name'),value:finite(talent.value??0,'talent value'),attributes:abilityProbe(talent)};}
  function normalizedSpell(spell){return {key:text(spell.name,'spell name'),name:text(spell.name,'spell name'),value:finite(spell.value??0,'spell value'),attributes:abilityProbe(spell),representation:String(spell.rep??''),complexity:spell.column??null};}
  function normalizedCapabilities(hero){
    const out=['check:attribute','check:talent'];
    if((hero?.spells||[]).length)out.push('check:spell');
    if((hero?.liturgyKnowledges||[]).length)out.push('check:liturgy');
    return out;
  }
  function defaultEnergyState(hero){return {};}
  function defaultCombatState(hero){return {combatTalents:(hero?.combat||[]).map(row=>({name:row.name,at:row.at,pa:row.pa}))};}
  function findHero(getHeroes,id){return array(getHeroes(),'heroes').find(hero=>String(hero?.key??hero?.heroId)===String(id))||null;}
  function findAbility(hero,kind,key){
    const wanted=String(key||'').trim().toLocaleLowerCase('de');
    const source=kind==='spell'?(hero?.spells||[]):kind==='liturgy'?(hero?.liturgyKnowledges||[]):(hero?.talents||[]);
    return source.find(item=>String(item?.name||'').trim().toLocaleLowerCase('de')===wanted)||null;
  }
  function resultDisplay(kind,result){
    if(result.status&&result.status!=='resolved')return String(result.outcome||result.status);
    if(kind==='attribute')return result.success?'Gelungen':'Misslungen';
    const unit=kind==='spell'?'ZfP*':kind==='liturgy'?'LkP*':'TaP*';
    return result.success?`Gelungen · ${result.points??0} ${unit}`:`Misslungen${result.outcome&&result.outcome!=='failure'?` · ${result.outcome}`:''}`;
  }
  function talentContext(request){return plain(request?.context?.talent)?request.context.talent:null;}
  function requestedTalentRuleProfile(request){const value=talentContext(request)?.ruleProfile;return value==null?'':String(value).trim();}
  function usesTalentRuleProfile(request){return request?.check?.kind==='talent'&&requestedTalentRuleProfile(request)===TALENT_RULE_PROFILE;}
  function encumbranceRuleFor(ability,definition){return String(ability?.be??'').trim()||(definition?.encumbranceRule??null);}
  function requiresEncumbrance(rule){
    const value=String(rule??'').trim().toUpperCase().replace(/\s+/g,'');
    return !!value&&value!=='-'&&value!=='0'&&value!=='KEINE';
  }
  function heroAttributeRecord(hero){const out={};for(const short of Object.keys(SHORT_TO_FULL))out[short]=shortValue(hero,short);return out;}
  function substitutionMeta(name,hero){
    return talents.substitutionOptions({name,heroTalents:hero?.talents||[]}).map(option=>({talent:option.talent.name,penalty:option.penalty}));
  }

  function createProvider({getHeroes,getEnergyState=defaultEnergyState,getCombatState=defaultCombatState,rollDie}={}){
    if(typeof getHeroes!=='function')throw new TypeError('getHeroes callback is required');
    if(typeof getEnergyState!=='function'||typeof getCombatState!=='function')throw new TypeError('energy/combat callbacks must be functions');
    if(typeof rollDie!=='function')throw new TypeError('rollDie callback is required');
    const d20=()=>{const roll=finite(rollDie(20),'d20');if(!Number.isInteger(roll)||roll<1||roll>20)throw new RangeError('rollDie(20) must return 1..20');return roll;};

    function listHeroes(){
      return array(getHeroes(),'heroes').map(hero=>({heroId:heroId(hero),name:text(hero.name,'hero name'),capabilities:normalizedCapabilities(hero)}));
    }
    function getHeroSnapshot(id){
      const hero=findHero(getHeroes,id);if(!hero)throw new RangeError(`hero not found: ${id}`);
      const attributes={};for(const short of Object.keys(SHORT_TO_FULL))attributes[short]=shortValue(hero,short);
      const energyRaw=getEnergyState(hero)||{},energies={};
      for(const [key,value] of Object.entries(energyRaw)){
        if(!value||typeof value!=='object')continue;
        const max=finite(value.max,`${key}.max`),current=finite(value.current??max,`${key}.current`);energies[key]={current,max};
      }
      return contract.heroSnapshotV1({
        heroId:heroId(hero),name:text(hero.name,'hero name'),attributes,energies,
        talents:(hero.talents||[]).filter(t=>abilityProbe(t).length===3).map(normalizedTalent),
        spells:(hero.spells||[]).filter(z=>abilityProbe(z).length===3).map(normalizedSpell),
        combat:getCombatState(hero)||{},capabilities:normalizedCapabilities(hero),
        display:{race:hero.race||'',culture:hero.culture||'',profession:hero.profession||''},
        source:{product:'heldenmobil-lab',hldKey:heroId(hero)}
      });
    }
    function unsupported(request,outcome,meta={}){
      return contract.checkResultV1({requestId:request.requestId,heroId:request.heroId,checkKind:request.check.kind,status:'unsupported',success:null,outcome,modifiers:request.modifiers,meta});
    }
    function executeDsa41TalentCheck(request,hero){
      const definition=talents.getTalentDefinition(request.check.key);
      if(!definition)return unsupported(request,'talent-definition-unavailable',{ruleProfile:TALENT_RULE_PROFILE,substitutions:[]});
      const substitutions=substitutionMeta(request.check.key,hero);
      const availability=talents.talentAvailability({name:request.check.key,heroTalents:hero.talents||[]});
      if(availability.status===talents.AVAILABILITY.UNACTIVATED_SPECIAL)return unsupported(request,'special-talent-unactivated',{ruleProfile:TALENT_RULE_PROFILE,substitutions});
      if(availability.status===talents.AVAILABILITY.SPECIAL_VALUE_NEGATIVE)return unsupported(request,'special-talent-negative',{ruleProfile:TALENT_RULE_PROFILE,substitutions});
      if(availability.status===talents.AVAILABILITY.BASIC_VALUE_MISSING)return unsupported(request,'basic-talent-value-unavailable',{ruleProfile:TALENT_RULE_PROFILE,substitutions});
      if(availability.status!==talents.AVAILABILITY.AVAILABLE||!availability.talent)return unsupported(request,'talent-unavailable',{ruleProfile:TALENT_RULE_PROFILE,substitutions});

      const context=talentContext(request)||{},ability=availability.talent,rule=encumbranceRuleFor(ability,definition),combat=getCombatState(hero)||{};
      let be=0;
      if(requiresEncumbrance(rule)){
        if(!Number.isFinite(Number(combat.be)))return unsupported(request,'encumbrance-state-unavailable',{ruleProfile:TALENT_RULE_PROFILE,encumbranceRule:rule,substitutions});
        be=Number(combat.be);
      }
      try{
        talents.resolveAttributeKeys({talent:ability,definition,override:context.attributeOverride??null});
        talents.encumbrancePenalty(rule,be);
      }catch(error){
        return unsupported(request,'talent-context-invalid',{ruleProfile:TALENT_RULE_PROFILE,message:error?.message||String(error),substitutions});
      }
      const rolls=[d20(),d20(),d20()];
      let resolved;
      try{
        resolved=talents.resolveTalentCheck({
          talent:ability,heroAttributes:heroAttributeRecord(hero),modifier:request.modifier,be,
          attributeOverride:context.attributeOverride??null,specialization:context.specialization??null,rolls
        });
      }catch(error){
        return unsupported(request,'talent-context-invalid',{ruleProfile:TALENT_RULE_PROFILE,message:error?.message||String(error),substitutions});
      }
      const modifiers=[...request.modifiers];
      if(resolved.encumbrancePenalty!==0)modifiers.push({source:'heldenmobil',value:resolved.encumbrancePenalty,reason:`eBE ${resolved.encumbranceRule}`,kind:'encumbrance'});
      const result=resolved.result;
      return contract.checkResultV1({
        requestId:request.requestId,heroId:request.heroId,checkKind:'talent',status:'resolved',success:result.success,outcome:result.outcome,
        qualityPoints:result.points,rolls:result.rolls,targets:result.targets,effectiveValue:result.effectiveSkill,modifiers,effects:[],resourceDeltas:[],
        display:{summary:resultDisplay('talent',result)},
        meta:{
          ruleProfile:TALENT_RULE_PROFILE,baseTaW:resolved.baseSkill,usedAttributes:resolved.attributeKeys,
          specialization:context.specialization??null,specializationBonus:resolved.specializationBonus,
          encumbranceRule:resolved.encumbranceRule,encumbrancePenalty:resolved.encumbrancePenalty,
          externalModifier:resolved.externalModifier,totalModifier:resolved.totalModifier,substitutions
        }
      });
    }
    function executeCheck(rawRequest){
      const request=contract.validateCheckRequestV1(rawRequest),hero=findHero(getHeroes,request.heroId);if(!hero)return unsupported(request,'hero-not-found');
      const kind=request.check.kind;
      if(kind==='attribute'){
        const short=String(request.check.key).toUpperCase(),full=SHORT_TO_FULL[short]||request.check.key;
        if(!FULL_TO_SHORT[full]&&!SHORT_TO_FULL[short])return unsupported(request,'attribute-not-found');
        const roll=d20(),base=propertyValue(hero,full),result=checks.checkAttribute({value:base,modifier:request.modifier,roll});
        return contract.checkResultV1({requestId:request.requestId,heroId:request.heroId,checkKind:kind,status:'resolved',success:result.success,outcome:result.success?'success':'failure',qualityPoints:null,rolls:[roll],targets:[result.target],effectiveValue:result.target,modifiers:request.modifiers,display:{summary:resultDisplay(kind,result)},meta:{baseValue:base}});
      }
      if(kind==='talent'){
        const requestedProfile=requestedTalentRuleProfile(request);
        if(requestedProfile&&requestedProfile!==TALENT_RULE_PROFILE)return unsupported(request,'talent-rule-profile-unsupported',{requestedRuleProfile:requestedProfile,supportedRuleProfile:TALENT_RULE_PROFILE});
        if(usesTalentRuleProfile(request))return executeDsa41TalentCheck(request,hero);
      }
      if(kind==='talent'||kind==='spell'||kind==='liturgy'){
        const ability=findAbility(hero,kind,request.check.key);if(!ability)return unsupported(request,'ability-not-found');
        const attrs=abilityProbe(ability);if(attrs.length!==3)return unsupported(request,'probe-not-modelled');
        const values=attrs.map(short=>shortValue(hero,short)),rolls=[d20(),d20(),d20()];
        let result;
        if(kind==='spell'){
          const mrRaw=request.context?.magicResistance??request.context?.mr??0,mr=Number.isFinite(Number(mrRaw))?Number(mrRaw):0;
          result=magic.spellCheck({values,zfw:ability.value,modifier:request.modifier,mr,rolls});
        }else if(kind==='liturgy')result=checks.checkLiturgy({values,skill:ability.value,modifier:request.modifier,rolls});
        else result=checks.checkTalent({values,skill:ability.value,modifier:request.modifier,rolls});
        return contract.checkResultV1({requestId:request.requestId,heroId:request.heroId,checkKind:kind,status:'resolved',success:result.success,outcome:result.outcome,qualityPoints:result.points,rolls:result.rolls,targets:result.targets,effectiveValue:result.effectiveSkill,modifiers:request.modifiers,effects:[],resourceDeltas:[],display:{summary:resultDisplay(kind,result)},meta:{attributes:attrs,baseValue:Number(ability.value),magicResistance:kind==='spell'?result.magicResistance??0:undefined}});
      }
      return unsupported(request,'check-kind-not-yet-bound');
    }

    return {bridgeCapabilities:[TALENT_CONTEXT_CAPABILITY],listHeroes,getHeroSnapshot,executeCheck};
  }

  return {TALENT_RULE_PROFILE,TALENT_CONTEXT_CAPABILITY,SHORT_TO_FULL,FULL_TO_SHORT,probeShortNames,createProvider};
});
