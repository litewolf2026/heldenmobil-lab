(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Wounds=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const num=(v)=>{const n=Number(v);if(!Number.isFinite(n))throw new TypeError('wound values must be finite');return n;};
  function woundThresholds({ko,eisern=false,glasknochen=false,attackModifier=0}={}){
    const k=num(ko),trait=(eisern?2:0)-(glasknochen?2:0),mod=num(attackModifier)+trait;
    return [Math.round(k/2)+mod,Math.round(k)+mod,Math.round(k*1.5)+mod];
  }
  function woundsFromDamage(sp,options={}){const damage=Math.max(0,num(sp)),thresholds=woundThresholds(options);let wounds=0;for(const threshold of thresholds)if(damage>threshold)wounds++;return {wounds,sp:damage,thresholds};}
  function woundModifiers({wounds=0,ignoredWounds=0}={}){const active=Math.max(0,Math.trunc(num(wounds))-Math.max(0,Math.trunc(num(ignoredWounds))));return {activeWounds:active,at:-2*active,pa:-2*active,fk:-2*active,iniBase:-2*active,ge:-2*active,gs:-active};}
  function woundIgnoreDifficulty(totalWounds){return 4*Math.max(0,Math.trunc(num(totalWounds)));}
  function woundHitEffects(newWounds){const count=Math.max(0,Math.trunc(num(newWounds)));return {newWounds:count,auLossDice:count>0?[1,6,0]:null};}
  return {woundThresholds,woundsFromDamage,woundModifiers,woundIgnoreDifficulty,woundHitEffects};
});
