(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilCombat=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function combatEbe(talent,be,combatMeta={}){const m=combatMeta[talent];return m?Math.max(0,Number(be||0)-Number(m.offset||0)):Number(be||0);}
  function adjustCombatForBE(at,pa,ebe){const e=Number(ebe||0);return {at:Number(at)-Math.floor(e/2),pa:Number(pa)-Math.ceil(e/2)};}
  function tpkkModifier(tpkk,kk){
    if(!tpkk)return {damage:0,combatPenalty:0};
    const [thr,step]=tpkk,s=Math.max(1,Number(step||1)),delta=Number(kk||0)-Number(thr||0);
    const damage=delta>=0?Math.floor(delta/s):-Math.floor(Math.abs(delta)/s);
    return {damage,combatPenalty:damage<0?Math.abs(damage):0};
  }
  function finalDamage(tp,tpkk,kk){if(!tp)return null;const out=[...tp],mod=tpkkModifier(tpkk,kk);out[2]=Number(out[2]||0)+mod.damage;return out;}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function zoneFromD20(r){r=clamp(Math.round(Number(r)||1),1,20);if(r>=19)return {label:'Kopf',key:'kopf'};if(r>=15)return {label:'Brust',key:'brust'};if(r>=9)return r%2?{label:'Schildarm (links)',key:'linkerarm'}:{label:'Schwertarm (rechts)',key:'rechterarm'};if(r>=7)return {label:'Bauch',key:'bauch'};return r%2?{label:'linkes Bein',key:'linkesbein'}:{label:'rechtes Bein',key:'rechtesbein'};}
  return {combatEbe,adjustCombatForBE,tpkkModifier,finalDamage,zoneFromD20};
});
