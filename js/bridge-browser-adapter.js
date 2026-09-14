(function(root,factory){
  const contract=typeof module==='object'&&module.exports?require('./bridge-contract-v1.js'):root.HeldenMobilBridgeContractV1;
  const api=factory(contract);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.HeldenMobilBrowserBridgeV1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(contract){
  'use strict';
  if(!contract)throw new Error('HeldenMobilBridgeContractV1 is required');

  const CHANNEL='heldenmobil-dsa41-bridge';
  const TRANSPORT_VERSION=1;
  const CAPABILITIES=Object.freeze({
    HERO_LIST:'hero:list',
    HERO_SNAPSHOT:'hero:snapshot:v1',
    CHECK_EXECUTE:'check:execute:v1',
    COMBAT_EXECUTE:'combat:execute:v1'
  });
  const TYPE_CAPABILITY=Object.freeze({
    'hero.list':CAPABILITIES.HERO_LIST,
    'hero.get':CAPABILITIES.HERO_SNAPSHOT,
    'check.execute':CAPABILITIES.CHECK_EXECUTE,
    'combat.execute':CAPABILITIES.COMBAT_EXECUTE
  });

  function plain(value){return value&&typeof value==='object'&&!Array.isArray(value);}
  function text(value,label){const out=String(value??'').trim();if(!out)throw new TypeError(`${label} must be a non-empty string`);return out;}
  function array(value,label){if(value==null)return[];if(!Array.isArray(value))throw new TypeError(`${label} must be an array`);return value;}
  function clone(value){if(value==null)return value;return JSON.parse(JSON.stringify(value));}
  function normalizeOrigins(values){
    const origins=new Set(array(values,'allowedOrigins').map(value=>text(value,'origin')));
    if(origins.has('*'))throw new RangeError('wildcard origin is not allowed');
    return origins;
  }
  function normalizeCapabilities(values){return new Set(array(values,'allowedCapabilities').map(value=>text(value,'capability')));}
  function providerCapabilities(provider,allowed){
    if(!provider)return[];
    const supported=[];
    if(typeof provider.listHeroes==='function')supported.push(CAPABILITIES.HERO_LIST);
    if(typeof provider.getHeroSnapshot==='function')supported.push(CAPABILITIES.HERO_SNAPSHOT);
    if(typeof provider.executeCheck==='function')supported.push(CAPABILITIES.CHECK_EXECUTE);
    if(typeof provider.executeCombat==='function')supported.push(CAPABILITIES.COMBAT_EXECUTE);
    return supported.filter(capability=>allowed.has(capability)).sort();
  }
  function normalizeHeroList(values){
    return array(values,'hero list').map((hero,index)=>{
      if(!plain(hero))throw new TypeError(`hero list entry ${index} must be an object`);
      return {heroId:text(hero.heroId,`hero[${index}].heroId`),name:text(hero.name,`hero[${index}].name`),capabilities:array(hero.capabilities,`hero[${index}].capabilities`).map(value=>text(value,'hero capability'))};
    });
  }
  function requestEnvelope(data){
    if(!plain(data)||data.channel!==CHANNEL)return null;
    return {messageId:text(data.messageId,'messageId'),type:text(data.type,'type'),version:Number(data.version),payload:plain(data.payload)?clone(data.payload):{}};
  }
  function responseEnvelope(request,type,{payload=null,error=null}={}){
    return {channel:CHANNEL,version:TRANSPORT_VERSION,replyTo:request.messageId,type,payload,error};
  }
  function bridgeError(code,message,details=null){return {code:String(code),message:String(message),details:details==null?null:clone(details)};}

  function createBridgeServer({allowedOrigins=[],allowedCapabilities=Object.values(CAPABILITIES),provider=null}={}){
    const origins=normalizeOrigins(allowedOrigins),enabled=normalizeCapabilities(allowedCapabilities);
    let currentProvider=provider;

    function capabilities(){return providerCapabilities(currentProvider,enabled);}
    function setProvider(next){if(next!=null&&!plain(next))throw new TypeError('provider must be an object or null');currentProvider=next;return capabilities();}
    function originAllowed(origin){return origins.has(String(origin||''));}
    function post(event,response){
      if(!event?.source||typeof event.source.postMessage!=='function')return false;
      event.source.postMessage(response,event.origin);
      return true;
    }
    function requireCapability(type){
      const required=TYPE_CAPABILITY[type];
      if(!required)return null;
      return capabilities().includes(required)?null:required;
    }
    async function dispatch(request){
      if(request.type==='bridge.hello'){
        const requested=array(request.payload?.capabilities,'payload.capabilities').map(value=>text(value,'requested capability'));
        const available=capabilities(),negotiated=requested.length?available.filter(value=>requested.includes(value)):available;
        return {type:'bridge.hello.result',payload:{product:'heldenmobil-lab',transportVersion:TRANSPORT_VERSION,contractVersion:contract.CONTRACT_VERSION,capabilities:negotiated}};
      }
      const missing=requireCapability(request.type);
      if(missing)return {type:'bridge.error',error:bridgeError('CAPABILITY_UNAVAILABLE',`Capability not available: ${missing}`)};
      if(!currentProvider)return {type:'bridge.error',error:bridgeError('PROVIDER_UNAVAILABLE','No HeldenMobil bridge provider is registered')};

      if(request.type==='hero.list'){
        const heroes=normalizeHeroList(await currentProvider.listHeroes());
        return {type:'hero.list.result',payload:{heroes}};
      }
      if(request.type==='hero.get'){
        const heroId=text(request.payload?.heroId,'payload.heroId');
        const hero=contract.validateHeroSnapshotV1(await currentProvider.getHeroSnapshot(heroId));
        return {type:'hero.get.result',payload:{hero}};
      }
      if(request.type==='check.execute'){
        const checkRequest=contract.validateCheckRequestV1(request.payload?.request);
        const result=contract.validateCheckResultV1(await currentProvider.executeCheck(checkRequest));
        if(result.requestId!==checkRequest.requestId||result.heroId!==checkRequest.heroId)throw new RangeError('provider returned a CheckResultV1 for a different request or hero');
        return {type:'check.execute.result',payload:{result}};
      }
      if(request.type==='combat.execute'){
        const action=contract.validateCombatActionV1(request.payload?.action);
        const result=contract.validateCombatResultV1(await currentProvider.executeCombat(action));
        if(result.actionId!==action.actionId||result.heroId!==action.heroId)throw new RangeError('provider returned a CombatResultV1 for a different action or hero');
        return {type:'combat.execute.result',payload:{result}};
      }
      return {type:'bridge.error',error:bridgeError('UNSUPPORTED_MESSAGE_TYPE',`Unsupported bridge message type: ${request.type}`)};
    }
    async function handleMessage(event){
      const request=requestEnvelope(event?.data);if(!request)return {handled:false,reason:'not-bridge-message'};
      if(!originAllowed(event?.origin))return {handled:false,reason:'origin-rejected'};
      if(request.version!==TRANSPORT_VERSION){
        const response=responseEnvelope(request,'bridge.error',{error:bridgeError('UNSUPPORTED_TRANSPORT_VERSION',`Unsupported transport version: ${request.version}`)});post(event,response);return {handled:true,response};
      }
      let dispatched;
      try{dispatched=await dispatch(request);}
      catch(error){dispatched={type:'bridge.error',error:bridgeError('PROVIDER_ERROR',error?.message||String(error))};}
      const response=responseEnvelope(request,dispatched.type,{payload:dispatched.payload??null,error:dispatched.error??null});post(event,response);return {handled:true,response};
    }
    return {channel:CHANNEL,transportVersion:TRANSPORT_VERSION,capabilities,setProvider,handleMessage,originAllowed};
  }

  function installWindowBridge({windowRef,allowedOrigins=[],allowedCapabilities=Object.values(CAPABILITIES),provider=null}={}){
    const target=windowRef||(typeof window!=='undefined'?window:null);if(!target||typeof target.addEventListener!=='function')throw new Error('window-like target is required');
    const server=createBridgeServer({allowedOrigins,allowedCapabilities,provider});
    const listener=event=>{server.handleMessage(event).catch(()=>{});};
    target.addEventListener('message',listener);
    return {server,dispose:()=>target.removeEventListener?.('message',listener)};
  }

  return {CHANNEL,TRANSPORT_VERSION,CAPABILITIES,createBridgeServer,installWindowBridge};
});
