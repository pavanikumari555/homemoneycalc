import { test } from "node:test";
import assert from "node:assert/strict";
import { webAnalytics, indiaDays } from "../scripts/agent/web-analytics.mjs";
import { ownerStatus } from "../scripts/agent/owner-status.mjs";
import { taxReview } from "../scripts/agent/tax-review.mjs";
import { summarize } from "../scripts/agent/summarize.mjs";
import { onRequest as trafficRequest } from "../functions/admin/api/traffic.js";
import { onRequest as reportRequest } from "../functions/admin/api/report.js";
import { auditDisposition } from "../scripts/agent/dependency-audit.mjs";
import { actionPlan } from "../scripts/agent/advisor.mjs";

test("India traffic buckets use local midnight, including UTC date changes",()=>{
  const d=indiaDays(new Date("2026-10-31T20:00:00Z"));
  assert.equal(d.length,8);assert.equal(d.at(-1).date,"2026-11-01");
  assert.equal(d.at(-1).start,"2026-10-31T18:30:00.000Z");
  assert.equal(d.at(-2).end,d.at(-1).start);assert.equal(d.at(-1).partial,true);
});
test("browser RUM never falls back to edge requests, preserves daily counts and sanitizes paths",async()=>{
  let calls=0;assert.equal((await webAnalytics({},()=>calls++)).connected,false);assert.equal(calls,0);
  const options={token:"fake-secret",accountId:"a".repeat(32),siteId:"b".repeat(32),now:new Date("2026-10-31T08:00:00Z")};
  const result=await webAnalytics(options,async(_,init)=>{
    const {query}=JSON.parse(init.body);assert.match(query,/requestHost:"homemoneycalc.com",bot:0/);assert.doesNotMatch(query,/httpRequests|clientIP|cookie/);
    const account=Object.fromEntries(Array.from({length:8},(_,i)=>[`d${i}`,[{count:i+3,sum:{visits:i+1}}]]));
    account.pages=[{count:2,dimensions:{requestPath:"/paycheck-calculator/?g=12345"}}];
    account.sources=[{sum:{visits:3},dimensions:{refererHost:"google.com"}}];
    return new Response(JSON.stringify({data:{viewer:{accounts:[account]}}}));
  });
  assert.equal(result.connected,true);assert.equal(result.today.visits,8);assert.equal(result.today.pageviews,10);
  assert.equal(result.pages[0].path,"/paycheck-calculator/");
  const bad=await webAnalytics(options,async()=>new Response(JSON.stringify({errors:[{message:"fake-secret raw-error"}]})));
  assert.equal(bad.connected,false);assert.doesNotMatch(JSON.stringify(bad),/fake-secret|raw-error/);
  const missing=await webAnalytics(options,async()=>new Response(JSON.stringify({data:{viewer:{accounts:[{}]}}})));
  assert.equal(missing.connected,false);
});
test("live owner endpoints are read-only, no-store and fail safely without secrets",async()=>{
  const request=new Request("https://homemoneycalc-admin.pages.dev/admin/api/traffic");
  const r=await trafficRequest({request,env:{}});assert.equal(r.headers.get("cache-control"),"no-store");assert.equal((await r.json()).connected,false);
  const missing=await reportRequest({request:new Request("https://homemoneycalc-admin.pages.dev/admin/api/report"),env:{}});assert.equal(missing.status,503);
  const post=await reportRequest({request:new Request(request.url,{method:"POST"}),env:{}});assert.equal(post.status,405);
});

test("RUM distinguishes permission from query errors without exposing upstream text or requesting needless access",async()=>{
  const options={token:"fake-secret",accountId:"a".repeat(32),siteId:"b".repeat(32)};
  for (const [message,status,who] of [["not authorized to access account fake-secret","permission-needed","owner"],["unknown field bot fake-secret","query-unsupported","agent"],["unexpected fake-secret","permission-or-query-error","agent"]]) {
    const traffic=await webAnalytics(options,async()=>new Response(JSON.stringify({errors:[{message}]})));
    assert.equal(traffic.status,status);assert.doesNotMatch(JSON.stringify(traffic),/fake-secret/);
    const task=actionPlan({date:"2026-10-31",sources:{gsc:true},health:{ran:true},traffic},{},"2026-10-31").find(t=>t.id==="web-traffic");
    assert.equal(task.who,who);
  }
});
test("latest report is selected by date and invalid report metadata never becomes live",async()=>{
  const report={date:"2026-10-31",generatedAt:"2026-10-31T03:00:00Z",health:{ran:true,errors:0}};
  let call=0;
  const fetcher=async()=>new Response(JSON.stringify(++call===1?[{type:"file",name:"2026-10-30.json"},{type:"file",name:"2026-10-31.json"},{type:"file",name:"evil.js"}]:{encoding:"base64",content:Buffer.from(JSON.stringify(report)).toString("base64")}));
  const r=await reportRequest({request:new Request("https://homemoneycalc-admin.pages.dev/admin/api/report"),env:{GITHUB_REPORT_TOKEN:"fake-secret"}},fetcher);
  assert.equal((await r.json()).report.date,"2026-10-31");
});
test("owner health never hides failed code checks behind a clean structural audit",()=>{
  const r={date:"2026-10-31",health:{ran:true,errors:0},quality:[{status:"fail"}],liveChecks:[{status:"pass"}]};
  assert.equal(ownerStatus(r,"2026-10-31").kind,"problem");
  r.quality[0].status="pass";r.liveChecks[0].status="unknown";assert.equal(ownerStatus(r,"2026-10-31").kind,"unknown");
  r.liveChecks[0].status="pass";assert.equal(ownerStatus(r,"2026-10-31").kind,"checked");
  assert.equal(ownerStatus(r,"2026-11-05").stale,true);
});
test("tax reviews become due at the interval and new tax year without modifying rates",()=>{
  const config={taxYear:2026,lastReviewed:"2026-10-31",reviewIntervalDays:30,rules:[{status:"older-parameters"}]};
  assert.equal(taxReview(config,"2026-11-01").due,false);assert.equal(taxReview(config,"2026-11-30").due,true);assert.equal(taxReview(config,"2027-01-01").yearChanged,true);
});
test("default report summary needs no AI key or paid provider and uses evidence",async()=>{
  const r=await summarize({sources:{gsc:true},kpis:{clicks:0,impressions:246},actions:[],ideas:{},health:{ran:true,errors:0}});
  assert.equal(r.by,"rules");assert.match(r.summary,/246/);assert.match(r.summary,/minimum rules nahi/);
});
test("unreviewed or new dependency findings cannot be silently waived",()=>{
  assert.equal(auditDisposition({metadata:{vulnerabilities:{total:2}}}).status,"fail");
  assert.equal(auditDisposition({metadata:{vulnerabilities:{total:0}}}).status,"pass");
  assert.equal(auditDisposition({}).status,"unknown");
});
