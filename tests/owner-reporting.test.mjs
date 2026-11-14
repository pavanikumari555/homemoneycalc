import { test } from "node:test";
import assert from "node:assert/strict";
import { webAnalytics, indiaDays } from "../scripts/agent/web-analytics.mjs";
import { ownerStatus, trafficForTasks } from "../scripts/agent/owner-status.mjs";
import { searchConsole, indexStatus } from "../scripts/agent/google.mjs";
import { buildLinkReview, parseTracker } from "../scripts/agent/link-review.mjs";
import { generateKeyPairSync } from "node:crypto";
import { taxReview } from "../scripts/agent/tax-review.mjs";
import { summarize } from "../scripts/agent/summarize.mjs";
import { onRequest as trafficRequest } from "../functions/admin/api/traffic.js";
import { onRequest as reportRequest } from "../functions/admin/api/report.js";
import { auditDisposition } from "../scripts/agent/dependency-audit.mjs";
import { actionPlan, indexProblems } from "../scripts/agent/advisor.mjs";
import { parseLinkCheck } from "../scripts/agent/source-links.mjs";

const trackerHeader="organization,research_url,resource_to_offer,status,submission_cost_verified,contact_channel_verified,contacted_on,response,published_reference_url,checked_on";
const trackerRow=(name,domain,status="research-only",contact="",response="",checked="2026-11-08")=>`${name},https://${domain}/resources,https://homemoneycalc.com/methodology/#classroom-examples,${status},no,no,${contact},${response},,${checked}`;
test("link research is capped at two, excludes contacted/opted-out domains and never submits",()=>{
  const csv=[trackerHeader,trackerRow("A","a.example"),trackerRow("A repeat","a.example"),trackerRow("B","b.example"),trackerRow("C","c.example"),trackerRow("A old contact","a.example","contacted","2026-11-01"),trackerRow("B","other.example","opt-out","","Do not contact")].join("\n");
  const plan=buildLinkReview(csv,"2026-11-08");
  assert.equal(plan.automatedSubmission,false);assert.equal(plan.status,"available");
  assert.deepEqual(plan.items.map(i=>i.organization),["C"]);
  const capped=buildLinkReview([trackerHeader,trackerRow("A","a.example"),trackerRow("B","b.example"),trackerRow("C","c.example")].join("\n"),"2026-11-08");
  assert.equal(capped.items.length,2);assert.ok(capped.items.every(i=>i.stage==="research-needed"&&i.blockers.length));
});
test("link tracker preserves quoted commas and fails closed on malformed/missing data",()=>{
  const quoted=trackerRow('"School, Inc."',"school.example");
  assert.equal(parseTracker(`${trackerHeader}\n${quoted}`)[0].organization,"School, Inc.");
  assert.equal(buildLinkReview('"broken',"2026-11-08").status,"unavailable");
  assert.equal(buildLinkReview("organization\nA","2026-11-08").status,"unavailable");
  const unsafe=trackerRow("A","a.example").replace("https://a.example/resources","javascript:alert(1)");
  assert.equal(buildLinkReview(`${trackerHeader}\n${unsafe}`,"2026-11-08").items.length,0);
  const stale=buildLinkReview(`${trackerHeader}\n${trackerRow("A","a.example","research-only","","","2026-01-01")}`,"2026-11-08");
  assert.match(stale.items[0].blockers[0],/purani/);
});

test("current traffic query failures create repair tasks without hiding the saved reading",()=>{
  const saved={connected:true,status:"connected",checkedAt:"2026-11-08T03:00:00Z",days:[]};
  assert.equal(trafficForTasks(saved,null,"checking"),saved);
  const current=trafficForTasks(saved,null,"query-unsupported");
  const task=actionPlan({date:"2026-11-08",sources:{gsc:true},health:{ran:true},traffic:current},{},"2026-11-08").find(t=>t.id==="web-traffic");
  assert.equal(task.who,"agent");assert.equal(saved.connected,true);
  const live={...saved,checkedAt:"2026-11-08T04:00:00Z"};
  assert.equal(trafficForTasks(saved,live,"connected"),live);
});

test("Search Console retains high-impression zero-click pages before display truncation",async()=>{
  const {privateKey}=generateKeyPairSync("rsa",{modulusLength:2048,privateKeyEncoding:{type:"pkcs8",format:"pem"},publicKeyEncoding:{type:"spki",format:"pem"}});
  const requests=[];
  const fetcher=async(url,options)=>{
    if(url.includes("oauth2"))return Response.json({access_token:"test-only-token"});
    const body=JSON.parse(options.body);requests.push(body);
    if(!body.dimensions)return Response.json({rows:[{clicks:2,impressions:400,ctr:.005,position:12}]});
    if(body.dimensions[0]==="date")return Response.json({rows:[]});
    const rows=Array.from({length:30},(_,i)=>({keys:[`https://example.test/a${i}`],clicks:0,impressions:1,ctr:0,position:20}));
    rows.push({keys:["https://example.test/percentage-calculator/"],clicks:0,impressions:299,ctr:0,position:9});
    return Response.json({rows:body.dimensions.length===1?rows:[]});
  };
  const r=await searchConsole({saJson:JSON.stringify({client_email:"test@example.invalid",private_key:privateKey}),site:"sc-domain:example.test"},fetcher);
  assert.equal(r.topPages.slice(0,15)[0].impressions,299);
  assert.equal(r.topQueries[0].impressions,299);assert.equal(r.totals.impressions,400);
  assert.ok(requests.filter(r=>r.dimensions?.includes("page")).every(r=>r.rowLimit===1000));
});

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

test("URL Inspection reads index status per URL, survives one failure and flags permission errors",async()=>{
  const {privateKey}=generateKeyPairSync("rsa",{modulusLength:2048,privateKeyEncoding:{type:"pkcs8",format:"pem"},publicKeyEncoding:{type:"spki",format:"pem"}});
  const saJson=JSON.stringify({client_email:"test@example.invalid",private_key:privateKey});
  const site="sc-domain:example.test";
  const sent=[];
  const fetcher=async(url,options)=>{
    if(url.includes("oauth2"))return Response.json({access_token:"fake-token"});
    const body=JSON.parse(options.body);sent.push(body);
    assert.equal(options.method,"POST");assert.equal(body.siteUrl,site);
    if(body.inspectionUrl.endsWith("/broken/"))return new Response("oops",{status:500});
    const indexed=body.inspectionUrl.endsWith("/a/");
    return Response.json({inspectionResult:{indexStatusResult:{verdict:indexed?"PASS":"NEUTRAL",coverageState:indexed?"Submitted and indexed":"Crawled - currently not indexed",pageFetchState:"SUCCESSFUL",robotsTxtState:"ALLOWED",lastCrawlTime:"2026-11-10T05:00:00Z"}}});
  };
  const r=await indexStatus({saJson,site,urls:["https://example.test/a/","https://example.test/b/","https://example.test/broken/"]},fetcher);
  assert.equal(r.connected,true);assert.equal(sent.length,3);
  assert.deepEqual([r.indexed,r.notIndexed,r.unknown],[1,1,1]);
  assert.equal(r.urls[1].coverage,"Crawled - currently not indexed");
  assert.equal(r.urls[2].status,"unknown");
  // Permission error: poora check "permission-needed", guessing nahi
  const denied=await indexStatus({saJson,site,urls:["https://example.test/a/"]},async(url)=>url.includes("oauth2")?Response.json({access_token:"t"}):new Response("forbidden",{status:403}));
  assert.equal(denied.status,"permission-needed");assert.equal(denied.connected,false);
  assert.equal((await indexStatus({saJson:"",site,urls:["x"]})).connected,false);
});

test("index alerts fire only for dropped or blocked pages, never for new pages still waiting",()=>{
  const u=(url,status,extra={})=>({url:`https://homemoneycalc.com${url}`,status,fetch:"SUCCESSFUL",robots:"ALLOWED",...extra});
  const base={date:"2026-11-14",sources:{gsc:true},health:{ran:true}};
  // Naya page abhi index nahi: koi alarm nahi
  const fresh={...base,indexing:{connected:true,urls:[u("/a/","indexed"),u("/new/","not-indexed")]},previousIndexing:[{url:"https://homemoneycalc.com/a/",status:"indexed"}]};
  assert.equal(indexProblems(fresh),null);
  assert.ok(!actionPlan(fresh,{},"2026-11-14").some(t=>t.id.startsWith("index-")));
  // Kal indexed tha, aaj nahi: owner alert
  const dropped={...base,indexing:{connected:true,urls:[u("/a/","not-indexed",{coverage:"Crawled - currently not indexed"})]},previousIndexing:[{url:"https://homemoneycalc.com/a/",status:"indexed"}]};
  const task=actionPlan(dropped,{},"2026-11-14").find(t=>t.id==="index-drop");
  assert.equal(task.who,"owner");assert.match(task.why,/\/a\//);
  // robots ne roka: agent fix
  const blocked={...base,indexing:{connected:true,urls:[u("/b/","not-indexed",{robots:"DISALLOWED"})]},previousIndexing:null};
  assert.equal(actionPlan(blocked,{},"2026-11-14").find(t=>t.id==="index-blocked").who,"agent");
  // Purana 404 crawl (page baad mein live hua): owner Request indexing kare, agent "blocked" nahi
  const stale={...base,indexing:{connected:true,urls:[u("/no-tax-on-overtime-calculator/","not-indexed",{fetch:"NOT_FOUND",lastCrawl:"2026-11-05T12:45:47Z"})]},previousIndexing:null};
  const staleTasks=actionPlan(stale,{},"2026-11-14");
  assert.equal(staleTasks.find(t=>t.id==="index-recrawl").who,"owner");
  assert.match(staleTasks.find(t=>t.id==="index-recrawl").why,/2026-11-05/);
  assert.ok(!staleTasks.some(t=>t.id==="index-blocked"));
  // Permission nahi: owner ko ek baar ka setup
  const access=actionPlan({...base,indexing:{connected:false,status:"permission-needed"}},{},"2026-11-14").find(t=>t.id==="index-access");
  assert.equal(access.who,"owner");
});

test("lychee result groups broken source links by URL and ignores timeouts",()=>{
  // Shape copied from lychee's own JSON formatter test
  const json={unique:40,timeouts:1,errors:2,
    error_map:{
      "out/paycheck-calculator/index.html":[{url:"https://www.irs.gov/old-page",status:{text:"Rejected status code: 404 Not Found",code:404}}],
      "out/bonus-tax-calculator/index.html":[{url:"https://www.irs.gov/old-page",status:{text:"Rejected status code: 404 Not Found",code:404}},{url:"mailto:x@y.z",status:{text:"bad"}}],
    },
    timeout_map:{"out/index.html":[{url:"https://slow.example/",status:{text:"Timeout"}}]}};
  const r=parseLinkCheck(json,"2026-11-16T03:00:00Z");
  assert.equal(r.checked,true);assert.equal(r.total,40);assert.equal(r.timeouts,1);
  assert.equal(r.broken.length,1);
  assert.deepEqual(r.broken[0],{url:"https://www.irs.gov/old-page",status:"HTTP 404",pages:["/paycheck-calculator/","/bonus-tax-calculator/"]});
  const task=actionPlan({date:"2026-11-16",sources:{gsc:true},health:{ran:true},sourceLinks:r},{},"2026-11-16").find(t=>t.id==="source-links");
  assert.equal(task.who,"agent");assert.match(task.why,/irs\.gov\/old-page/);
  // Sab theek ho to koi task nahi
  assert.ok(!actionPlan({date:"2026-11-16",sources:{gsc:true},health:{ran:true},sourceLinks:parseLinkCheck({unique:5,error_map:{}},"x")},{},"2026-11-16").some(t=>t.id==="source-links"));
});
