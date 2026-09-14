(function(root,factory){
  const legacy=typeof module==='object'&&module.exports?require('../combat-core.js'):root.HeldenMobilCombat;
  const api=factory(legacy);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41HeroCombat=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(legacy){
  'use strict';
  if(!legacy)throw new Error('HeldenMobilCombat is required');
  const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d;};
  const setOf=(v)=>v instanceof Set?v:new Set(v||[]);

  function armorWeighted(zones,weights){
    let sum=0,total=0;
    for(const [key,weightRaw] of Object.entries(weights||{})){const weight=num(weightRaw);sum+=num(zones?.[key])*weight;total+=weight;}
    return total>0?sum/total:0;
  }
  function armorPieceBE({zones={},stars=0,partial=false}={},weights={}){const grs=armorWeighted(zones,weights);return partial&&num(stars)>0?grs/2:Math.max(0,grs-num(stars));}
  function armorSet({pieces=[],weights={},specialAbilities=[],rg1=[]}={}){
    const sf=setOf(specialAbilities),zoneKeys=Object.keys(weights||{}),zones=Object.fromEntries(zoneKeys.map(k=>[k,0]));let rawBE=0;
    const normalized=pieces.map(piece=>{
      const z={};for(const k of zoneKeys){z[k]=num(piece.zones?.[k]);zones[k]+=z[k];}
      const stars=num(piece.stars),rawRS=armorWeighted(z,weights),pieceRawBE=piece.rawBE==null?armorPieceBE({zones:z,stars,partial:!!piece.partial},weights):num(piece.rawBE);
      rawBE+=pieceRawBE;
      return {...piece,zones:z,stars,rawRS,rawBE:pieceRawBE,rs:piece.rs==null?Math.round(rawRS):num(piece.rs),be:piece.be==null?Math.round(pieceRawBE):num(piece.be)};
    });
    const rawRS=armorWeighted(zones,weights),rs=Math.round(rawRS),baseBE=Math.round(rawBE);
    let reduction=0;
    if(sf.has('Rüstungsgewöhnung III'))reduction=2;
    else if(sf.has('Rüstungsgewöhnung II'))reduction=1;
    else if((rg1||[]).length&&normalized.some(p=>rg1.some(r=>p.base===r||p.name===r||String(p.name||'').includes(r)||String(r||'').includes(p.name||''))))reduction=1;
    return {pieces:normalized,zones,rs,rawRS,baseBE,rawBE,be:Math.max(0,baseBE-reduction),beReduction:reduction};
  }

  function speedInfo({race='',ge=0,be=0,flink=0,behagig=false,raceGs={Zwerg:6}}={}){
    let base=raceGs?.[race];if(base==null)base=/Zwerg/i.test(race)?6:8;const parts=[`Grund ${base}`];
    if(num(ge)>=16){base+=1;parts.push('GE>=16 +1');}else if(num(ge)<=10){base-=1;parts.push('GE<=10 -1');}
    if(num(flink)){base+=num(flink);parts.push(`Flink +${num(flink)}`);}if(behagig){base-=1;parts.push('Behäbig -1');}
    const value=Math.max(0,base-num(be));parts.push(`BE -${num(be)}`);return {value,base,parts};
  }
  function dodge({paBase=0,be=0,specialAbilities=[],flink=0,behagig=false,acrobatics=0}={}){
    const sf=setOf(specialAbilities);let sfBonus=0;for(const rank of ['Ausweichen I','Ausweichen II','Ausweichen III'])if(sf.has(rank))sfBonus+=3;
    const acro=num(acrobatics),acroBonus=acro>=12?1+Math.floor((acro-12)/3):0,otherMod=num(flink)-(behagig?1:0);
    return {base:num(paBase),be:num(be),sfBonus,acroBonus,acroValue:acro,flinkBonus:num(flink),otherMod,value:num(paBase)-num(be)+sfBonus+acroBonus+otherMod};
  }
  function initiativeSfBonus({be=0,specialAbilities=[]}={}){
    const sf=setOf(specialAbilities);let bonus=0;const parts=[];
    if(sf.has('Kampfreflexe')){if(num(be)<=4){bonus+=4;parts.push('Kampfreflexe +4');}else parts.push('Kampfreflexe inaktiv (BE>4)');}
    if(sf.has('Kampfgespür')){bonus+=2;parts.push('Kampfgespür +2');}return {bonus,parts};
  }
  function initiativeForLoadout({iniBase=0,be=0,specialAbilities=[],weaponIni=0,shieldIni=0,pairPenalty=0}={}){
    const sf=setOf(specialAbilities),bonus=initiativeSfBonus({be,specialAbilities:sf});
    const fixed=num(iniBase)-num(be)+bonus.bonus+num(weaponIni)+num(shieldIni)-num(pairPenalty),dancer=sf.has('Klingentänzer')&&num(be)<3;
    return {base:num(iniBase),setBE:num(be),sf:bonus,weaponIni:num(weaponIni),shieldIni:num(shieldIni),pairPenalty:num(pairPenalty),fixed,dice:dancer?'2W6':'1W6'};
  }
  function offhandPenalty({beidhaendig=false,specialAbilities=[]}={}){const sf=setOf(specialAbilities);if(beidhaendig||sf.has('Beidhändiger Kampf II'))return 0;if(sf.has('Beidhändiger Kampf I'))return 3;if(sf.has('Linkhand'))return 6;return 9;}
  function dualPairModifier({rightBase='',leftBase='',rightTalent='',leftTalent=''}={}){if(rightBase===leftBase)return {at:0,pa:0,note:'gleichartige Waffen'};if(rightTalent===leftTalent)return {at:-1,pa:-1,note:'verschiedene Waffen, gleiches Talent'};return {at:-2,pa:-2,note:'verschiedene Waffentalente'};}
  function meleeValues({baseAt,basePa,ebe=0,specialized=false,wm=[0,0],shieldWmAt=0,tp=null,tpkk=null,kk=0}={}){
    if(baseAt==null||basePa==null)return {at:null,pa:null,tp:legacy.finalDamage(tp,tpkk,kk)};
    const adj=legacy.adjustCombatForBE(num(baseAt),num(basePa),num(ebe)),tpkkMod=legacy.tpkkModifier(tpkk,kk),combatPenalty=tpkkMod.combatPenalty;
    return {at:adj.at+(specialized?1:0)+num(wm?.[0])+num(shieldWmAt)-combatPenalty,pa:adj.pa+(specialized?1:0)+num(wm?.[1])-combatPenalty,tp:legacy.finalDamage(tp,tpkk,kk),tpkk:tpkkMod};
  }
  function rangedValue({fkBase=0,talentValue=0,ebe=0,specialized=false}={}){return num(fkBase)+num(talentValue)-num(ebe)+(specialized?2:0);}
  function shieldParry({parryWeapon=false,mainPA=null,paBase=0,mainEbe=0,wmPa=0,weaponPA=0,specialAbilities=[]}={}){
    const sf=setOf(specialAbilities),wm=num(wmPa);
    if(parryWeapon){if(mainPA!=null){if(sf.has('Parierwaffen II'))return num(mainPA)+2+wm;if(sf.has('Parierwaffen I'))return num(mainPA)-1+wm;}return num(paBase)-Math.ceil(num(mainEbe)/2)+wm+(sf.has('Linkhand')?1:0);}
    let pa=num(paBase)+wm;if(sf.has('Linkhand'))pa+=1;if(sf.has('Schildkampf I'))pa+=2;if(sf.has('Schildkampf II'))pa+=2;
    const wpa=num(weaponPA);if(wpa>=21)pa+=3;else if(wpa>=18)pa+=2;else if(wpa>=15)pa+=1;return pa;
  }

  return {armorWeighted,armorPieceBE,armorSet,speedInfo,dodge,initiativeSfBonus,initiativeForLoadout,offhandPenalty,dualPairModifier,meleeValues,rangedValue,shieldParry};
});
