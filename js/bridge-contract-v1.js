(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilBridgeContractV1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const CONTRACT_VERSION=1;
  const SCHEMAS=Object.freeze({
    HERO:'HeroSnapshotV1',
    CHECK_REQUEST:'CheckRequestV1',
    CHECK_RESULT:'CheckResultV1',
    RESOURCE_DELTA:'ResourceDeltaV1',
    COMBAT_ACTION:'CombatActionV1',
    COMBAT_RESULT:'CombatResultV1'
  });
  const CHECK_KINDS=new Set(['attribute','talent','spell','liturgy','attack','parry','ranged']);
  const RESULT_STATUS=new Set(['resolved','cancelled','unsupported','error']);
  const EFFECT_TYPES=new Set(['modifier','damage','heal','resource','state','manual']);

  function clone(value){
    if(value==null)return value;
    try{return JSON.parse(JSON.stringify(value));}
    catch(_){throw new TypeError('bridge values must be JSON-serializable');}
  }
  function obj(value,label){if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError(`${label} must be an object`);return value;}
  function str(value,label,{empty=false}={}){const out=String(value??'');if(!empty&&!out.trim())throw new TypeError(`${label} must be a non-empty string`);return out;}
  function finite(value,label){const out=Number(value);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;}
  function maybeFinite(value,label){return value==null?null:finite(value,label);}
  function bool(value){return !!value;}
  function stringArray(value,label){if(value==null)return[];if(!Array.isArray(value))throw new TypeError(`${label} must be an array`);return value.map((item,index)=>str(item,`${label}[${index}]`));}
  function numericRecord(value,label){
    const source=value==null?{}:obj(value,label),out={};
    for(const [key,item] of Object.entries(source))out[str(key,`${label} key`)]=finite(item,`${label}.${key}`);
    return out;
  }
  function envelope(schema,payload){return {schema,version:CONTRACT_VERSION,...payload};}
  function assertHeader(value,schema){
    const input=obj(value,schema);
    if(input.schema!==schema)throw new RangeError(`expected schema ${schema}`);
    if(input.version!==CONTRACT_VERSION)throw new RangeError(`unsupported ${schema} version: ${input.version}`);
    return input;
  }

  function normalizeModifier(value,index=0){
    const m=obj(value,`modifier[${index}]`);
    return {source:str(m.source??'unknown',`modifier[${index}].source`),value:finite(m.value??0,`modifier[${index}].value`),reason:str(m.reason??'',`modifier[${index}].reason`,{empty:true}),kind:str(m.kind??'difficulty',`modifier[${index}].kind`)};
  }
  function normalizeModifiers(values){if(values==null)return[];if(!Array.isArray(values))throw new TypeError('modifiers must be an array');return values.map(normalizeModifier);}
  function normalizeEffect(value,index=0){
    const e=obj(value,`effect[${index}]`),type=str(e.type,`effect[${index}].type`);
    if(!EFFECT_TYPES.has(type))throw new RangeError(`unsupported effect type: ${type}`);
    return {type,source:str(e.source??'unknown',`effect[${index}].source`),target:str(e.target??'self',`effect[${index}].target`),payload:clone(e.payload??{}),duration:e.duration==null?null:clone(e.duration),requiresConfirmation:bool(e.requiresConfirmation)};
  }
  function normalizeEffects(values){if(values==null)return[];if(!Array.isArray(values))throw new TypeError('effects must be an array');return values.map(normalizeEffect);}
  function normalizeEnergy(value,key){
    const e=obj(value,`energies.${key}`),current=finite(e.current,`energies.${key}.current`),max=finite(e.max,`energies.${key}.max`);
    if(current<0||max<0||current>max)throw new RangeError(`invalid energy range for ${key}`);
    return {current,max};
  }
  function normalizeEnergies(values){const source=values==null?{}:obj(values,'energies'),out={};for(const [key,value] of Object.entries(source))out[str(key,'energy key')]=normalizeEnergy(value,key);return out;}
  function normalizeAbility(value,index,{spell=false}={}){
    const a=obj(value,`ability[${index}]`),attrs=stringArray(a.attributes??[],`ability[${index}].attributes`);
    if(attrs.length&&attrs.length!==3)throw new RangeError(`ability[${index}].attributes must contain three entries when present`);
    const out={key:str(a.key??a.name,`ability[${index}].key`),name:str(a.name??a.key,`ability[${index}].name`),value:finite(a.value,`ability[${index}].value`),attributes:attrs};
    if(spell){out.representation=str(a.representation??'',`ability[${index}].representation`,{empty:true});out.complexity:a.complexity==null?null:clone(a.complexity);}
    return out;
  }
  function normalizeAbilities(values,options){if(values==null)return[];if(!Array.isArray(values))throw new TypeError('abilities must be an array');return values.map((value,index)=>normalizeAbility(value,index,options));}

  function heroSnapshotV1({heroId,name,attributes={},energies={},talents=[],spells=[],combat={},capabilities=[],display={},source={}}={}){
    return envelope(SCHEMAS.HERO,{
      heroId:str(heroId,'heroId'),
      name:str(name,'name'),
      attributes:numericRecord(attributes,'attributes'),
      energies:normalizeEnergies(energies),
      talents:normalizeAbilities(talents,{spell:false}),
      spells:normalizeAbilities(spells,{spell:true}),
      combat:clone(obj(combat??{},'combat')),
      capabilities:stringArray(capabilities,'capabilities'),
      display:clone(obj(display??{},'display')),
      source:clone(obj(source??{},'source'))
    });
  }

  function normalizeCheck(value){
    const check=obj(value,'check'),kind=str(check.kind,'check.kind');
    if(!CHECK_KINDS.has(kind))throw new RangeError(`unsupported check kind: ${kind}`);
    return {kind,key:str(check.key??check.name,'check.key'),label:str(check.label??check.name??check.key,'check.label'),mode:str(check.mode??'standard','check.mode')};
  }
  function checkRequestV1({requestId,heroId,check,modifier=0,modifiers=[],context={}}={}){
    return envelope(SCHEMAS.CHECK_REQUEST,{
      requestId:str(requestId,'requestId'),heroId:str(heroId,'heroId'),check:normalizeCheck(check),modifier:finite(modifier,'modifier'),modifiers:normalizeModifiers(modifiers),context:clone(obj(context??{},'context'))
    });
  }

  function resourceDeltaV1({resource,current,delta,allowed=true,next=null,reason='',source='rule-core'}={}){
    const before=finite(current,'current'),change=finite(delta,'delta'),isAllowed=bool(allowed),computed=isAllowed?before+change:before;
    if(before<0)throw new RangeError('current resource must not be negative');
    if(isAllowed&&computed<0)throw new RangeError('allowed resource delta must not make resource negative');
    const after=next==null?computed:finite(next,'next');
    if(after<0)throw new RangeError('next resource must not be negative');
    if(Math.abs(after-computed)>1e-9)throw new RangeError('next resource does not match current + delta/allowed state');
    return envelope(SCHEMAS.RESOURCE_DELTA,{resource:str(resource,'resource'),current:before,delta:change,next:after,allowed:isAllowed,reason:str(reason,'reason',{empty:true}),source:str(source,'source')});
  }
  function normalizeResourceDeltas(values){if(values==null)return[];if(!Array.isArray(values))throw new TypeError('resourceDeltas must be an array');return values.map(value=>validateResourceDeltaV1(value));}

  function checkResultV1({requestId,heroId,checkKind,status='resolved',success=null,outcome='',qualityPoints=null,rolls=[],targets=[],effectiveValue=null,modifiers=[],effects=[],resourceDeltas=[],display={},meta={}}={}){
    const state=str(status,'status');if(!RESULT_STATUS.has(state))throw new RangeError(`unsupported result status: ${state}`);
    const kind=str(checkKind,'checkKind');if(!CHECK_KINDS.has(kind))throw new RangeError(`unsupported check kind: ${kind}`);
    if(state==='resolved'&&typeof success!=='boolean')throw new TypeError('resolved CheckResultV1 requires boolean success');
    if(state!=='resolved'&&success!=null)throw new TypeError('non-resolved CheckResultV1 must use success=null');
    if(!Array.isArray(rolls)||!Array.isArray(targets))throw new TypeError('rolls and targets must be arrays');
    const qp=qualityPoints==null?null:finite(qualityPoints,'qualityPoints');if(qp!=null&&qp<0)throw new RangeError('qualityPoints must not be negative');
    return envelope(SCHEMAS.CHECK_RESULT,{
      requestId:str(requestId,'requestId'),heroId:str(heroId,'heroId'),checkKind:kind,status:state,success:success==null?null:bool(success),outcome:str(outcome,'outcome',{empty:true}),qualityPoints:qp,
      rolls:rolls.map((value,index)=>finite(value,`rolls[${index}]`)),targets:targets.map((value,index)=>finite(value,`targets[${index}]`)),effectiveValue:maybeFinite(effectiveValue,'effectiveValue'),
      modifiers:normalizeModifiers(modifiers),effects:normalizeEffects(effects),resourceDeltas:normalizeResourceDeltas(resourceDeltas),display:clone(obj(display??{},'display')),meta:clone(obj(meta??{},'meta'))
    });
  }

  function combatActionV1({actionId,heroId,kind,targetRef=null,weaponRef=null,maneuvers=[],modifier=0,context={},payload={}}={}){
    return envelope(SCHEMAS.COMBAT_ACTION,{actionId:str(actionId,'actionId'),heroId:str(heroId,'heroId'),kind:str(kind,'kind'),targetRef:targetRef==null?null:str(targetRef,'targetRef'),weaponRef:weaponRef==null?null:str(weaponRef,'weaponRef'),maneuvers:clone(Array.isArray(maneuvers)?maneuvers:(()=>{throw new TypeError('maneuvers must be an array')})()),modifier:finite(modifier,'modifier'),context:clone(obj(context??{},'context')),payload:clone(obj(payload??{},'payload'))});
  }
  function combatResultV1({actionId,heroId,status='resolved',checkResult=null,effects=[],resourceDeltas=[],display={},meta={}}={}){
    const state=str(status,'status');if(!RESULT_STATUS.has(state))throw new RangeError(`unsupported result status: ${state}`);
    return envelope(SCHEMAS.COMBAT_RESULT,{actionId:str(actionId,'actionId'),heroId:str(heroId,'heroId'),status:state,checkResult:checkResult==null?null:validateCheckResultV1(checkResult),effects:normalizeEffects(effects),resourceDeltas:normalizeResourceDeltas(resourceDeltas),display:clone(obj(display??{},'display')),meta:clone(obj(meta??{},'meta'))});
  }

  function validateHeroSnapshotV1(value){const v=assertHeader(value,SCHEMAS.HERO);return heroSnapshotV1(v);}
  function validateCheckRequestV1(value){const v=assertHeader(value,SCHEMAS.CHECK_REQUEST);return checkRequestV1(v);}
  function validateResourceDeltaV1(value){const v=assertHeader(value,SCHEMAS.RESOURCE_DELTA);return resourceDeltaV1(v);}
  function validateCheckResultV1(value){const v=assertHeader(value,SCHEMAS.CHECK_RESULT);return checkResultV1(v);}
  function validateCombatActionV1(value){const v=assertHeader(value,SCHEMAS.COMBAT_ACTION);return combatActionV1(v);}
  function validateCombatResultV1(value){const v=assertHeader(value,SCHEMAS.COMBAT_RESULT);return combatResultV1(v);}
  function validateContractV1(value){
    const input=obj(value,'contract'),schema=str(input.schema,'schema');
    const validators={
      [SCHEMAS.HERO]:validateHeroSnapshotV1,[SCHEMAS.CHECK_REQUEST]:validateCheckRequestV1,[SCHEMAS.CHECK_RESULT]:validateCheckResultV1,
      [SCHEMAS.RESOURCE_DELTA]:validateResourceDeltaV1,[SCHEMAS.COMBAT_ACTION]:validateCombatActionV1,[SCHEMAS.COMBAT_RESULT]:validateCombatResultV1
    };
    const validator=validators[schema];if(!validator)throw new RangeError(`unsupported bridge schema: ${schema}`);return validator(input);
  }

  return {CONTRACT_VERSION,SCHEMAS,CHECK_KINDS,RESULT_STATUS,EFFECT_TYPES,heroSnapshotV1,checkRequestV1,checkResultV1,resourceDeltaV1,combatActionV1,combatResultV1,validateHeroSnapshotV1,validateCheckRequestV1,validateCheckResultV1,validateResourceDeltaV1,validateCombatActionV1,validateCombatResultV1,validateContractV1};
});
