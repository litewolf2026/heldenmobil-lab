(function(root,factory){
  const legacy=typeof module==='object'&&module.exports?require('../combat-core.js'):root.HeldenMobilCombat;
  const checks=typeof module==='object'&&module.exports?require('./check-core.js'):root.HeldenMobilDsa41Check;
  const api=factory(legacy,checks);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Combat=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(legacy,checks){
  'use strict';
  if(!legacy)throw new Error('HeldenMobilCombat is required');
  if(!checks)throw new Error('HeldenMobilDsa41Check is required');
  function combatCheck({kind='attack',target,modifier=0,roll}){return {...checks.checkAttribute({value:target,modifier,roll}),type:'combat',kind};}
  return {
    combatEbe:legacy.combatEbe,
    adjustCombatForBE:legacy.adjustCombatForBE,
    finalDamage:legacy.finalDamage,
    zoneFromD20:legacy.zoneFromD20,
    combatCheck,
    attackCheck:(args)=>combatCheck({...args,kind:'attack'}),
    parryCheck:(args)=>combatCheck({...args,kind:'parry'}),
    rangedCheck:(args)=>combatCheck({...args,kind:'ranged'})
  };
});
