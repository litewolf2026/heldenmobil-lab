(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Damage=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function finite(value,label){const out=Number(value);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;}
  function damageAfterArmor(tp,rs=0){const raw=Math.max(0,finite(tp,'tp')),armor=Math.max(0,finite(rs,'rs'));return {tp:raw,rs:armor,sp:Math.max(0,raw-armor)};}
  function directDamage(sp){const value=Math.max(0,finite(sp,'sp'));return {tp:null,rs:null,sp:value,direct:true};}
  return {damageAfterArmor,directDamage};
});
