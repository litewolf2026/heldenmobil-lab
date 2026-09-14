(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Conditions=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const num=(v)=>{const n=Number(v);if(!Number.isFinite(n))throw new TypeError('condition values must be finite');return n;};
  function fractionStage(current,max,cuts){const c=num(current),m=num(max);if(m<=0)return 0;for(const [fraction,stage] of cuts)if(c<m*fraction)return stage;return 0;}
  function lowLifeEffects({current,max,ignorePenalties=false,canActBelow5=false}={}){
    const c=num(current),stage=ignorePenalties?0:fractionStage(c,max,[[0.25,3],[1/3,2],[0.5,1]]);
    return {stage,propertyDifficulty:stage,combatDifficulty:stage,check3Difficulty:stage*3,gsPenalty:stage,incapacitated:c<=5&&!canActBelow5};
  }
  function lowStaminaEffects({current,max}={}){
    const c=num(current),stage=fractionStage(c,max,[[0.25,2],[1/3,1]]);
    return {stage,propertyDifficulty:stage,combatDifficulty:stage,check3Difficulty:stage*3,iniPenalty:stage,incapacitated:c<=0};
  }
  function combinedConditionEffects({life,stamina,ignoreLowLifePenalties=false,canActBelow5=false}={}){
    const le=life?lowLifeEffects({...life,ignorePenalties:ignoreLowLifePenalties,canActBelow5}):lowLifeEffects({current:6,max:6}),au=stamina?lowStaminaEffects(stamina):lowStaminaEffects({current:1,max:1});
    return {life:le,stamina:au,propertyDifficulty:le.propertyDifficulty+au.propertyDifficulty,combatDifficulty:le.combatDifficulty+au.combatDifficulty,check3Difficulty:le.check3Difficulty+au.check3Difficulty,gsPenalty:le.gsPenalty||0,iniPenalty:au.iniPenalty||0,incapacitated:le.incapacitated||au.incapacitated};
  }
  return {lowLifeEffects,lowStaminaEffects,combinedConditionEffects};
});
