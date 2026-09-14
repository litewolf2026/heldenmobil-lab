import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const browserBridge=require('../js/bridge-browser-adapter.js');
const contract=require('../js/bridge-contract-v1.js');
const fixture=JSON.parse(fs.readFileSync(new URL('../contracts/fixtures/bridge-v1-sample.json',import.meta.url),'utf8'));

function eq(actual,expected,label){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(`${label}: expected ${e}, got ${a}`);}
function ok(value,label){if(!value)throw new Error(label);}
function throws(fn,label){let did=false;try{fn();}catch(_){did=true;}if(!did)throw new Error(`${label}: expected exception`);}
function source(){const calls=[];return {calls,postMessage:(message,origin)=>calls.push({message,origin})};}
function event({origin='https://maze.example',messageId='m1',type='bridge.hello',payload={},version=1,sourceRef=source()}={}){return {origin,source:sourceRef,data:{channel:browserBridge.CHANNEL,version,messageId,type,payload}};}

throws(()=>browserBridge.createBridgeServer({allowedOrigins:['*']}),'wildcard origins are forbidden');
throws(()=>browserBridge.createBridgeServer({allowedOrigins:['https://maze.example'],sourceGuard:true}),'source guard must be a function');

let listCalls=0,getCalls=0,checkCalls=0,combatCalls=0;
const provider={
  listHeroes:async()=>{listCalls++;return [{heroId:fixture.hero.heroId,name:fixture.hero.name,capabilities:fixture.hero.capabilities}];},
  getHeroSnapshot:async heroId=>{getCalls++;if(heroId!==fixture.hero.heroId)throw new Error('hero not found');return fixture.hero;},
  executeCheck:async request=>{checkCalls++;return {...fixture.checkResult,requestId:request.requestId,heroId:request.heroId};},
  executeCombat:async action=>{combatCalls++;return contract.combatResultV1({actionId:action.actionId,heroId:action.heroId,status:'resolved',checkResult:null,effects:[],resourceDeltas:[]});}
};
const server=browserBridge.createBridgeServer({allowedOrigins:['https://maze.example'],provider});

eq(server.capabilities(),['check:execute:v1','combat:execute:v1','hero:list','hero:snapshot:v1'],'provider capabilities are explicit and sorted');

let src=source();let ev=event({origin:'https://evil.example',sourceRef:src});let handled=await server.handleMessage(ev);
eq([handled.handled,handled.reason,src.calls.length,listCalls],[false,'origin-rejected',0,0],'untrusted origin is silently ignored');

const trustedSource=source(),otherSource=source();
const sourceLocked=browserBridge.createBridgeServer({allowedOrigins:['https://maze.example'],provider,sourceGuard:event=>event.source===trustedSource});
ev=event({sourceRef:otherSource});handled=await sourceLocked.handleMessage(ev);eq([handled.handled,handled.reason,otherSource.calls.length],[false,'source-rejected',0],'same-origin but wrong source window is rejected');
ev=event({sourceRef:trustedSource});handled=await sourceLocked.handleMessage(ev);eq(handled.response.type,'bridge.hello.result','allowed source window passes second gate');

src=source();ev=event({sourceRef:src,payload:{capabilities:['hero:list','check:execute:v1','unknown']}});handled=await server.handleMessage(ev);
eq(handled.response.type,'bridge.hello.result','hello succeeds');
eq(handled.response.payload.capabilities,['check:execute:v1','hero:list'],'hello negotiates only available requested capabilities in canonical order');
eq(src.calls[0].origin,'https://maze.example','reply uses exact incoming origin, never wildcard');

src=source();ev=event({sourceRef:src,messageId:'m2',type:'hero.list'});handled=await server.handleMessage(ev);
eq([handled.response.type,handled.response.payload.heroes[0].heroId,listCalls],['hero.list.result',fixture.hero.heroId,1],'hero.list delegates only after origin/capability gate');

src=source();ev=event({sourceRef:src,messageId:'m3',type:'hero.get',payload:{heroId:fixture.hero.heroId}});handled=await server.handleMessage(ev);
eq([handled.response.type,handled.response.payload.hero.schema,getCalls],['hero.get.result','HeroSnapshotV1',1],'hero.get returns validated HeroSnapshotV1');

src=source();ev=event({sourceRef:src,messageId:'m4',type:'check.execute',payload:{request:fixture.checkRequest}});handled=await server.handleMessage(ev);
eq([handled.response.type,handled.response.payload.result.schema,checkCalls],['check.execute.result','CheckResultV1',1],'check.execute validates request and result');

src=source();ev=event({sourceRef:src,messageId:'m5',type:'combat.execute',payload:{action:fixture.combatAction}});handled=await server.handleMessage(ev);
eq([handled.response.type,handled.response.payload.result.schema,combatCalls],['combat.execute.result','CombatResultV1',1],'combat.execute contract is prepared behind capability gate');

src=source();ev=event({sourceRef:src,messageId:'m6',version:2});handled=await server.handleMessage(ev);
eq([handled.response.type,handled.response.error.code],['bridge.error','UNSUPPORTED_TRANSPORT_VERSION'],'transport version mismatch fails closed');

const listOnly=browserBridge.createBridgeServer({allowedOrigins:['https://maze.example'],allowedCapabilities:['hero:list'],provider});
src=source();ev=event({sourceRef:src,messageId:'m7',type:'hero.get',payload:{heroId:fixture.hero.heroId}});handled=await listOnly.handleMessage(ev);
eq([handled.response.type,handled.response.error.code,getCalls],['bridge.error','CAPABILITY_UNAVAILABLE',1],'disabled capability cannot reach provider');

const noProvider=browserBridge.createBridgeServer({allowedOrigins:['https://maze.example']});
src=source();ev=event({sourceRef:src,messageId:'m8',type:'hero.list'});handled=await noProvider.handleMessage(ev);
eq([handled.response.type,handled.response.error.code],['bridge.error','CAPABILITY_UNAVAILABLE'],'unregistered provider exposes no capabilities');

const badProvider={...provider,executeCheck:async request=>({...fixture.checkResult,requestId:'wrong-request',heroId:request.heroId})};
const strict=browserBridge.createBridgeServer({allowedOrigins:['https://maze.example'],provider:badProvider});
src=source();ev=event({sourceRef:src,messageId:'m9',type:'check.execute',payload:{request:fixture.checkRequest}});handled=await strict.handleMessage(ev);
eq([handled.response.type,handled.response.error.code],['bridge.error','PROVIDER_ERROR'],'mismatched provider response is rejected');

let listener=null;const fakeWindow={addEventListener:(name,fn)=>{if(name==='message')listener=fn;},removeEventListener:(name,fn)=>{if(name==='message'&&listener===fn)listener=null;}};
const installed=browserBridge.installWindowBridge({windowRef:fakeWindow,allowedOrigins:['https://maze.example'],provider});ok(typeof listener==='function','window adapter installs one message listener');installed.dispose();eq(listener,null,'window adapter disposes listener');

console.log('AP19.3 browser bridge origin/capability/source-window regression tests passed');
