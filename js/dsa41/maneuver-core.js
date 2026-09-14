(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Maneuvers=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const EXCLUDED_FINTE_TALENTS=new Set(['Kettenwaffen','Peitschen','Zweihandflegel','Zweihand-Hiebwaffen']);
  const n=(v,label)=>{const out=Number(v);if(!Number.isFinite(out))throw new TypeError(`${label} must be finite`);return out;};
  function validateAnnouncement({announcement,taw,at}={}){
    const value=n(announcement,'announcement'),talent=n(taw,'taw'),attack=n(at,'at');
    if(value<0||!Number.isInteger(value))throw new RangeError('announcement must be a non-negative integer');
    const max=Math.max(0,Math.min(talent,attack));if(value>max)throw new RangeError(`announcement ${value} exceeds maximum ${max}`);
    return {announcement:value,max,taw:talent,at:attack};
  }
  function wuchtschlag({announcement,taw,at,hasSf=false}={}){
    const valid=validateAnnouncement({announcement,taw,at}),damageBonus=hasSf?valid.announcement:Math.ceil(valid.announcement/2);
    return {type:'wuchtschlag',allowed:true,announcement:valid.announcement,attackDifficulty:valid.announcement,damageBonus,failurePenalty:valid.announcement,hasSf:!!hasSf};
  }
  function finte({announcement,taw,at,hasSf=false,be=0,shield=false,smallShield=false,weaponTalent=''}={}){
    const valid=validateAnnouncement({announcement,taw,at}),encumbrance=n(be,'be');
    if(encumbrance>4)return {type:'finte',allowed:false,reason:'BE>4',announcement:valid.announcement};
    if(EXCLUDED_FINTE_TALENTS.has(String(weaponTalent)))return {type:'finte',allowed:false,reason:'weapon-talent',announcement:valid.announcement};
    const shieldDifficulty=shield&&!smallShield?2:0,defenseDifficulty=hasSf?valid.announcement:Math.ceil(valid.announcement/2);
    return {type:'finte',allowed:true,announcement:valid.announcement,attackDifficulty:valid.announcement+shieldDifficulty,baseAttackDifficulty:valid.announcement,shieldDifficulty,defenseDifficulty,failurePenalty:valid.announcement,hasSf:!!hasSf};
  }
  function splitWuchtschlagFinte({damageAnnouncement=0,defenseAnnouncement=0,taw,at,hasWuchtschlag=false,hasFinte=false,be=0,shield=false,smallShield=false,weaponTalent=''}={}){
    const damage=n(damageAnnouncement,'damageAnnouncement'),defense=n(defenseAnnouncement,'defenseAnnouncement'),total=damage+defense;
    validateAnnouncement({announcement:total,taw,at});
    const ws=wuchtschlag({announcement:damage,taw,at,hasSf:hasWuchtschlag}),ft=finte({announcement:defense,taw,at,hasSf:hasFinte,be,shield,smallShield,weaponTalent});
    if(!ft.allowed)return {...ft,type:'wuchtschlag-finte',damageAnnouncement:damage,defenseAnnouncement:defense};
    return {type:'wuchtschlag-finte',allowed:true,announcement:total,damageAnnouncement:damage,defenseAnnouncement:defense,attackDifficulty:total+ft.shieldDifficulty,damageBonus:ws.damageBonus,defenseDifficulty:ft.defenseDifficulty,failurePenalty:total,shieldDifficulty:ft.shieldDifficulty};
  }
  return {EXCLUDED_FINTE_TALENTS,validateAnnouncement,wuchtschlag,finte,splitWuchtschlagFinte};
});
