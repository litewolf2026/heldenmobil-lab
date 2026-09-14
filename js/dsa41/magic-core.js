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
  function resourceDeltaPreview({current,cost,resource='AsP'}={}){const have=Math.max(0,num(current)),spend=Math.max(0,num(cost));return {resource,current:have,cost:spend,allowed:spend<=have,next:Math.max(0,have-spend),delta:-Math.min(have,spend)};}
  return {spellCheck,resourceDeltaPreview};
});
