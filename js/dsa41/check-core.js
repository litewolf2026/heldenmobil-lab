(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Check=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const n=(value)=>{const out=Number(value);if(!Number.isFinite(out))throw new TypeError('check values must be finite numbers');return out;};
  function triplet(values,label){if(!Array.isArray(values)||values.length!==3)throw new TypeError(`${label} must contain exactly three values`);return values.map(n);}
  function classifyThreeD20(rolls){const r=triplet(rolls,'rolls'),ones=r.filter(x=>x===1).length,twenties=r.filter(x=>x===20).length;return {ones,twenties,criticalLevel:ones>=3?2:ones>=2?1:0,fumbleLevel:twenties>=3?2:twenties>=2?1:0};}
  function checkAttribute({value,modifier=0,roll}){const base=n(value),difficulty=n(modifier),die=n(roll),target=base-difficulty;return {type:'attribute',success:die<=target,target,base,modifier:difficulty,roll:die,naturalOne:die===1,naturalTwenty:die===20};}
  function checkThree({values,skill,modifier=0,rolls}){
    const attrs=triplet(values,'values'),dice=triplet(rolls,'rolls'),baseSkill=n(skill),difficulty=n(modifier),effectiveSkill=baseSkill-difficulty,crit=classifyThreeD20(dice);
    let success=false,spent=0,points=0,targets=[...attrs];
    if(effectiveSkill>=0){spent=dice.reduce((sum,value,index)=>sum+Math.max(0,value-attrs[index]),0);success=spent<=effectiveSkill;points=success?Math.max(1,effectiveSkill-spent):0;}
    else{targets=attrs.map(value=>value+effectiveSkill);success=dice.every((value,index)=>value<=targets[index]);points=success?1:0;}
    let outcome=success?'success':'failure';
    if(crit.criticalLevel){success=true;points=Math.max(1,points);outcome=crit.criticalLevel===2?'triple-one':'critical-success';}
    else if(crit.fumbleLevel){success=false;points=0;outcome=crit.fumbleLevel===2?'triple-twenty':'fumble';}
    return {type:'check3',success,outcome,points,skill:baseSkill,modifier:difficulty,effectiveSkill,values:attrs,targets,rolls:dice,spent,...crit};
  }
  function semantic(kind,skillLabel,resultLabel,args){return {...checkThree(args),kind,skillLabel,resultLabel};}
  const checkTalent=(args)=>semantic('talent','TaW','TaP*',args);
  const checkSpell=(args)=>semantic('spell','ZfW','ZfP*',args);
  const checkLiturgy=(args)=>semantic('liturgy','LkW','LkP*',args);
  return {classifyThreeD20,checkAttribute,checkThree,checkTalent,checkSpell,checkLiturgy};
});
