(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilDsa41Dice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function assertSides(sides){const s=Number(sides);if(!Number.isInteger(s)||s<2)throw new RangeError('sides must be an integer >= 2');return s;}
  function rollDie(sides,rng=Math.random){const s=assertSides(sides),raw=Number(rng());if(!Number.isFinite(raw)||raw<0||raw>=1)throw new RangeError('rng must return a number in [0,1)');return 1+Math.floor(raw*s);}
  function createRoller(rng=Math.random){return {die:(sides)=>rollDie(sides,rng),d20:()=>rollDie(20,rng),d6:()=>rollDie(6,rng),threeD20:()=>[rollDie(20,rng),rollDie(20,rng),rollDie(20,rng)]};}
  function createSequenceRoller(values){const queue=Array.from(values||[],Number);let index=0;function next(sides){const s=assertSides(sides);if(index>=queue.length)throw new RangeError('fixture dice sequence exhausted');const value=queue[index++];if(!Number.isInteger(value)||value<1||value>s)throw new RangeError(`fixture die ${value} is invalid for W${s}`);return value;}return {die:next,d20:()=>next(20),d6:()=>next(6),threeD20:()=>[next(20),next(20),next(20)],remaining:()=>queue.length-index};}
  return {rollDie,createRoller,createSequenceRoller};
});
