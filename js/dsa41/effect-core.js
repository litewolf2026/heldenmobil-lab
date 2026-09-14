(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Effects=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const ALLOWED_TYPES=new Set(['modifier','damage','heal','resource','state','manual']);
  function finite(value,label){const out=Number(value);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;}
  function effect({type,source='unknown',target='self',payload={},duration=null,requiresConfirmation=false}={}){
    const kind=String(type||'');if(!ALLOWED_TYPES.has(kind))throw new RangeError(`unsupported effect type: ${kind}`);
    return {type:kind,source:String(source),target:String(target),payload:{...(payload||{})},duration:duration==null?null:duration,requiresConfirmation:!!requiresConfirmation};
  }
  function modifierEffect({source,target='self',stat,value,reason='',duration=null,requiresConfirmation=false}={}){return effect({type:'modifier',source,target,duration,requiresConfirmation,payload:{stat:String(stat||''),value:finite(value,'modifier value'),reason:String(reason)}});}
  function damageEffect({source,target='target',amount=null,dice=null,kind='SP',armorApplies=false,requiresConfirmation=true}={}){return effect({type:'damage',source,target,requiresConfirmation,payload:{amount:amount==null?null:finite(amount,'damage amount'),dice:Array.isArray(dice)?[...dice]:null,kind:String(kind),armorApplies:!!armorApplies}});}
  function healEffect({source,target='target',amount=null,dice=null,resource='LeP',requiresConfirmation=true}={}){return effect({type:'heal',source,target,requiresConfirmation,payload:{amount:amount==null?null:finite(amount,'heal amount'),dice:Array.isArray(dice)?[...dice]:null,resource:String(resource)}});}
  function resourceEffect({source,target='self',resource='AsP',delta,requiresConfirmation=true}={}){return effect({type:'resource',source,target,requiresConfirmation,payload:{resource:String(resource),delta:finite(delta,'resource delta')}});}
  function stateEffect({source,target='target',state,active=true,duration=null,requiresConfirmation=true}={}){return effect({type:'state',source,target,duration,requiresConfirmation,payload:{state:String(state||''),active:!!active}});}
  function manualEffect({source,target='target',reason='unmodeled-effect'}={}){return effect({type:'manual',source,target,requiresConfirmation:true,payload:{reason:String(reason)}});}
  return {ALLOWED_TYPES,effect,modifierEffect,damageEffect,healEffect,resourceEffect,stateEffect,manualEffect};
});
