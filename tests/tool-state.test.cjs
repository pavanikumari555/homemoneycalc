const assert=require("node:assert/strict");
const {test}=require("node:test");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),ts=require("typescript");
require.extensions[".ts"]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
const {encodeDebtRows,decodeDebtRows,MAX_DEBT_STATE_LENGTH}=require("../lib/debt-state.ts");
const defaults={d:"Default~100~5~10",x:"250",s:"avalanche"};
const rules={d:{maxLength:MAX_DEBT_STATE_LENGTH,valid:s=>decodeDebtRows(s)!==null}};
const rows=Array.from({length:15},(_,i)=>({name:"Saved debt "+i,balance:String(1000+i),rate:"12",min:"20"}));

// Execute the real hook against deterministic storage/history and a hook scheduler.
// This checks hydration/save/reopen integration without sending live analytics.
function fixture(search="",initial=[]) {
  const storage=new Map(initial),slots=[],timers=new Map(); let cursor=0,pending=[],timerId=0;
  function useState(value){const i=cursor++;if(!slots[i])slots[i]={value};return [slots[i].value,value=>{slots[i].value=typeof value==="function"?value(slots[i].value):value;}];}
  function useRef(current){const i=cursor++;if(!slots[i])slots[i]={current};return slots[i];}
  function useEffect(fn,deps){const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){old?.cleanup?.();slots[i]={deps};pending.push(()=>{slots[i].cleanup=fn();});}}
  const location={search,pathname:"/debt-payoff-calculator/",origin:"https://homemoneycalc.com"};
  const window={location,history:{replaceState:(_,__,url)=>{location.search=new URL(url,location.origin).search;}},dispatchEvent:()=>{},setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)};
  const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
  const hookModule={exports:{}};
  const compiled=ts.transpileModule(fs.readFileSync(path.join(__dirname,"../lib/useToolState.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const load=id=>id==="react"?{useState,useRef,useEffect,useCallback:fn=>fn,useSyncExternalStore:(_,snapshot)=>snapshot()}:require(path.resolve(__dirname,"../lib",id));
  vm.runInNewContext("(function(require,module,exports){"+compiled+"})",{window,localStorage,URLSearchParams,Event,URL,Date})(load,hookModule,hookModule.exports);
  function render(){cursor=0;pending=[];const state=hookModule.exports.useToolState("debt-payoff-calculator",defaults,{s:["snowball","avalanche"]},rules);for(const fn of pending)fn();return state;}
  return {get:()=>{render();return render();},storage,flush:()=>{for(const fn of timers.values())fn();timers.clear();}};
}

test("real hook hydrates, shares, saves and reopens all fifteen debts",()=>{
  const d=encodeDebtRows(rows),f=fixture("?"+new URLSearchParams({d,x:"404",s:"snowball"}));
  let state=f.get(); assert.equal(state.values.d,d);assert.equal(state.restoreWarning,"");assert.equal(state.origin,"shared");
  assert.equal(new URL(state.shareUrl()).searchParams.get("d"),d);
  state.saveScenario("Fifteen debts");state=f.get();const id=state.saved[0].id;
  state.set("d","Different~50~0~10");state=f.get();state.loadScenario(id);state=f.get();
  assert.equal(state.values.d,d);f.flush();
  const reopened=fixture("",[...f.storage]).get();assert.equal(reopened.origin,"restored");assert.equal(reopened.values.d,d);
});

test("corrupt shared debt never silently falls back to another stored plan",()=>{
  const stored=JSON.stringify({d:encodeDebtRows(rows),x:"999",s:"snowball"});
  const f=fixture("?d=broken",[["hmc:last:debt-payoff-calculator",stored]]);
  const state=f.get();assert.equal(state.origin,"shared");assert.equal(state.values.d,defaults.d);assert.match(state.restoreWarning,/could not be restored/);
  state.reset();assert.equal(f.get().restoreWarning,"");
});

test("ordinary campaign query parameters do not block restoring the last session",()=>{
  const d=encodeDebtRows(rows),f=fixture("?utm_source=example",[["hmc:last:debt-payoff-calculator",JSON.stringify({d,x:"50",s:"avalanche"})]]);
  assert.equal(f.get().values.d,d);assert.equal(f.get().restoreWarning,"");
});
