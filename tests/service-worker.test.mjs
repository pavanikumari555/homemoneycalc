import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

function worker({ offline = false, quota = false, storageUnavailable = false } = {}) {
  const handlers = {}, records = new Map(), removed = [], response = body => new Response(body);
  records.set("https://homemoneycalc.com/", response("old home"));
  const cache = { addAll: async () => {}, match: async r => records.get(r.url), put: async (r, v) => { if (quota) throw Error("full"); records.set(r.url, v); } };
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    URL, self: { location: {origin:"https://homemoneycalc.com"}, addEventListener: (n, fn) => handlers[n] = fn, skipWaiting: async () => {}, clients: {claim:async()=>{}} },
    caches: {open:async()=>{if(storageUnavailable)throw Error("storage blocked");return cache;}, keys:async()=>["homemoneycalc-v1","homemoneycalc-v2","other-app"], delete:async key=>removed.push(key)},
    fetch:async()=>{if(offline)throw Error("offline");return response("fresh home");},
  });
  return {handlers, records, removed, request: async (path="/", mode="navigate", method="GET") => {
    let pending;
    handlers.fetch({request:{url:new URL(path,"https://homemoneycalc.com").href,mode,method},respondWith:p=>pending=p});
    return pending ? (await pending).text() : null;
  }};
}

test("homepage uses fresh HTML online and cached HTML only when offline", async()=>{
  const live=worker(); assert.equal(await live.request(),"fresh home");
  assert.equal(await (live.records.get("https://homemoneycalc.com/")).text(),"fresh home");
  assert.equal(await worker({offline:true}).request(),"old home");
  assert.equal(await worker({quota:true}).request(),"fresh home");
  assert.equal(await worker({storageUnavailable:true}).request(),"fresh home");
});
test("worker leaves private/query/cross-origin/RSC requests to the network",async()=>{
  for(const path of ["/admin/","/admin/api/report","/?salary=50000","/?_rsc=abc","https://external.example/"])
    assert.equal(await worker().request(path),null);
  assert.equal(await worker().request("/","cors"),null);
  assert.equal(await worker().request("/","navigate","POST"),null);
});
test("worker removes only its obsolete cache versions",async()=>{
  const w=worker();let pending;w.handlers.activate({waitUntil:p=>pending=p});await pending;
  assert.deepEqual(w.removed,["homemoneycalc-v1"]);
});

test("export gives each worker a build cache version inside its cleanup namespace",()=>{
  const root=mkdtempSync(join(tmpdir(),"hmc-worker-test-"));
  try {
    mkdirSync(join(root,"out"));mkdirSync(join(root,"lib"));
    writeFileSync(join(root,"lib/site.ts"),"export const ALL_TOOLS = []; export const CATEGORY_LABELS = {};");
    writeFileSync(join(root,"out/sw.js"),readFileSync(new URL("../public/sw.js",import.meta.url)));
    execFileSync(process.execPath,[fileURLToPath(new URL("../scripts/prune-unreleased.mjs",import.meta.url))],{cwd:root,env:{...process.env,BUILD_DATE:"2026-11-08"},windowsHide:true});
    assert.match(readFileSync(join(root,"out/sw.js"),"utf8"),/const CACHE_NAME = "homemoneycalc-2026-11-08-[a-z0-9]+";/);
  } finally { rmSync(root,{recursive:true,force:true}); }
});
