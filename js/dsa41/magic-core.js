(function(root,factory){
  const checks=typeof module==='object'&&module.exports?require('./check-core.js'):root.HeldenMobilDsa41Check;
  const api=factory(checks);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Magic=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(checks){
  'use strict';
  if(!checks)throw new Error('HeldenMobilDsa41Check is required');
  function num(value){const out=Number(value||0);if(!Number.isFinite(out))throw new TypeError('magic modifier must be finite');return out;}
  function spellCheck({values,zfw,modifier=0,mr=0,rolls}){const baseModifier=num(modifier),magicResistance=num(mr),checkModifier=baseModifier+magicResistance;return {...checks.checkSpell({values,skill:zfw,modifier:checkModifier,rolls}),baseModifier,magicResistance};}
  function roundCost(value){return Math.max(0,Math.round(num(value)));}
  function spellCost({plannedCost,success,representation='',failedFraction=null,minimum=0}={}){
    const planned=Math.max(0,num(plannedCost)),fraction=failedFraction==null?(/hex|satuar/i.test(String(representation))?1/3:1/2):num(failedFraction);
    const raw=success?planned:planned*fraction,cost=Math.max(Math.max(0,num(minimum)),roundCost(raw));
    return {plannedCost:planned,success:!!success,representation:String(representation),failedFraction:success?null:fraction,cost};
  }
  function repeatFailureModifier({failedAttempts=0,hasZauberroutine=false}={}){const attempts=Math.max(0,Math.trunc(num(failedAttempts)));return hasZauberroutine?0:attempts*3;}
  function forceSpellEffectCost(reliefPoints){const relief=Math.max(0,Math.trunc(num(reliefPoints)));return relief===0?0:2**(relief-1);}
  function resourceDeltaPreview({current,cost,resource='AsP'}={}){const have=Math.max(0,num(current)),spend=Math.max(0,num(cost));return {resource,current:have,cost:spend,allowed:spend<=have,next:Math.max(0,have-spend),delta:-Math.min(have,spend)};}
  return {spellCheck,roundCost,spellCost,repeatFailureModifier,forceSpellEffectCost,resourceDeltaPreview};
});
