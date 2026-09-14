(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Modifier=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function modifier({source='unknown',value=0,reason='',kind='difficulty'}={}){const amount=Number(value);if(!Number.isFinite(amount))throw new TypeError('modifier value must be finite');return {source:String(source),value:amount,reason:String(reason),kind:String(kind)};}
  function total(modifiers=[],kind=null){return modifiers.filter(x=>!kind||x.kind===kind).reduce((sum,x)=>sum+Number(x.value||0),0);}
  function explain(modifiers=[]){return modifiers.map(x=>({source:x.source,value:Number(x.value||0),reason:x.reason||'',kind:x.kind||'difficulty'}));}
  return {modifier,total,explain};
});
