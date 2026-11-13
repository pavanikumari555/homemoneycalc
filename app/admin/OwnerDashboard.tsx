"use client";
import { useEffect, useState, type ReactNode } from "react";
import Icon, { type AnyIcon } from "@/components/Icon";
import ApprovalInbox from "./ApprovalInbox";
import ResearchMonitor from "./ResearchMonitor";
import LinkReviewPanel from "./LinkReviewPanel";
import ShareDrafts from "./ShareDrafts";
import { actionPlan, searchDrop } from "@/scripts/agent/advisor.mjs";
import { ownerStatus, trafficForTasks } from "@/scripts/agent/owner-status.mjs";
import { ANALYTICS_DASHBOARD } from "@/lib/analytics-config.mjs";
type Json = any;
type Props = { today: string; siteUrl: string; repo: string; report: Json; linkReview: Json; business: Json; revenue: Json; offers: Json[]; security: Json[]; tasks: Json[]; readiness: Json; approvalQueue: Json; approvalHistory: Json; research: Json; monetization: Json; tools: {slug:string;title:string;date:string}[] };

// Left menu: har section ek kaam. "hint" heading ke neeche ek line mein batata hai ki yahan kya milega.
const NAV: {id:string;label:string;icon:AnyIcon;hint:string}[] = [
  {id:"overview",label:"Aaj ka haal",icon:"home",hint:"Ek nazar mein website ka haal aur sabse zaroori kaam."},
  {id:"traffic",label:"Visits",icon:"chart",hint:"Website pe kitne log aaye, kaunse pages khule, kahan se aaye."},
  {id:"search",label:"Google Search",icon:"search",hint:"Google mein site kitni baar dikhi, kitne clicks aaye, kaunse words se."},
  {id:"work",label:"Zaroori kaam",icon:"check",hint:"Aapke karne wale kaam, developer ke fixes aur approvals."},
  {id:"share",label:"Share & Promotion",icon:"share",hint:"Copy karke post karne ke drafts aur safe backlink research."},
  {id:"earning",label:"AdSense",icon:"wallet",hint:"Earning ki taiyaari. Apply abhi hold par hai."},
  {id:"system",label:"System & Safety",icon:"shield",hint:"Automatic checks, technical details aur aane wale calculators."},
  {id:"help",label:"Madad (Guide)",icon:"bookmark",hint:"Panel kaise use karein: aasaan steps."},
];
const number = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v.toLocaleString("en-IN",{maximumFractionDigits:0}) : "—";
const decimal = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0 ? v.toFixed(1) : "—";
const time = (v?:string) => v && Number.isFinite(Date.parse(v)) ? new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(v))+" IST" : "Update nahi mila";
const date = (v:string) => new Date(`${v}T12:00:00Z`).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
function Panel({title,children}:{title:string;children:ReactNode}) { return <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6"><h2 className="text-lg font-bold text-ink">{title}</h2><div className="mt-4">{children}</div></section>; }
function Metric({title,value,note,onOpen,warn}:{title:string;value:string;note:string;onOpen?:()=>void;warn?:boolean}) {
  const body=<><p className="text-sm font-medium text-muted">{title}</p><p className="mt-3 break-words text-3xl font-extrabold tracking-tight text-ink">{value}</p><p className="mt-2 text-xs leading-relaxed text-muted">{note}</p>{onOpen&&<span className="mt-3 inline-block text-xs font-bold text-ivy-700 dark:text-ivy-300">Details dekhein →</span>}</>;
  const cls=`rounded-2xl border p-5 text-left ${warn?"border-sun-300 bg-sun-100/40":"border-line bg-surface"}`;
  return onOpen?<button type="button" onClick={onOpen} className={`${cls} transition hover:border-ivy-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ivy-400`}>{body}</button>:<div className={cls}>{body}</div>;
}
function Tasks({items,empty}:{items:Json[];empty:string}) { return items.length ? <ol className="space-y-3">{items.map((task,i)=><li key={task.id} className="rounded-xl bg-surface-2 p-4"><div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-sm font-bold text-ivy-700">{i+1}</span><div className="min-w-0"><h3 className="font-semibold text-ink">{task.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{task.why}</p><details className="mt-2 text-sm"><summary className="cursor-pointer font-semibold text-ivy-700 dark:text-ivy-300">Steps dekhein</summary><ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">{task.steps.map((s:string)=><li key={s}>{s}</li>)}</ol>{task.url&&<a className="mt-3 inline-block font-semibold underline" href={task.url} target="_blank" rel="noopener noreferrer">Yahan kholein ↗</a>}</details></div></div></li>)}</ol> : <p className="text-sm leading-relaxed text-muted">{empty}</p>; }

export default function OwnerDashboard(p:Props) {
  const [view,setView]=useState("overview");
  const [report,setReport]=useState(p.report);
  const [traffic,setTraffic]=useState<Json>(p.report?.traffic??null);
  const [connection,setConnection]=useState("checking");
  const [trafficConnection,setTrafficConnection]=useState("checking");
  const [busy,setBusy]=useState(false);
  const [today,setToday]=useState(p.today);
  const [refreshKey,setRefreshKey]=useState(0);
  const [clock,setClock]=useState<number|null>(null);
  useEffect(()=>{
    let active=true;
    const read=async(path:string)=>{const response=await fetch(path,{cache:"no-store",credentials:"same-origin",signal:AbortSignal.timeout(20000)});if((!response.ok&&response.status!==503)||!response.headers.get("content-type")?.includes("application/json"))throw new Error("Unavailable");return response.json();};
    const refresh=async()=>{
      if(!active)return;setBusy(true);setClock(Date.now());
      setToday(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));
      await Promise.allSettled([
        read("/admin/api/report").then(d=>{if(!active)return;if(d.status==="connected"){setReport(d.report);setConnection("connected");}else{setConnection(d.status==="setup-needed"?"setup-needed":"saved");}}).catch(()=>{if(active)setConnection("saved");}),
        read("/admin/api/traffic").then(d=>{if(active){setTrafficConnection(d.status);if(d.connected)setTraffic(d);}}).catch(()=>{if(active)setTrafficConnection("unavailable");})
      ]);if(active){setClock(Date.now());setBusy(false);}
    };
    void refresh();const timer=setInterval(()=>{if(document.visibilityState==="visible")void refresh();},300000);
    return()=>{active=false;clearInterval(timer);};
  },[refreshKey]);
  // Desktop: page upar. Mobile: menu ke neeche wale section heading tak scroll, taaki content turant dikhe.
  const open=(id:string)=>{setView(id);requestAnimationFrame(()=>{if(window.innerWidth<1024)document.getElementById("admin-section")?.scrollIntoView({block:"start"});else window.scrollTo({top:0});});};
  const status=ownerStatus(report,today);
  const currentTraffic = trafficForTasks(report?.traffic, traffic, trafficConnection);
  const tasks=actionPlan(report || currentTraffic ? {...report,traffic:currentTraffic} : report,p.business,today);
  const growthTasks=tasks.filter((t:Json)=>t.id==="grow");
  const ownerTasks=tasks.filter((t:Json)=>t.who==="owner"), agentTasks=tasks.filter((t:Json)=>t.who==="agent" && t.id!=="grow");
  const savedTraffic=report?.traffic?.connected?report.traffic:null;
  const snapshot=traffic?.connected&&(!savedTraffic||Date.parse(traffic.checkedAt)>=Date.parse(savedTraffic.checkedAt))?traffic:savedTraffic;
  const freshTraffic=snapshot?.connected&&trafficConnection==="connected"&&snapshot===traffic&&clock!==null&&clock>=Date.parse(snapshot.checkedAt)&&(clock-Date.parse(snapshot.checkedAt))<15*60000;
  const day=snapshot?.days?.find((d:Json)=>d.date===today);
  const previousDate=new Date(Date.parse(`${today}T12:00:00Z`)-86400000).toISOString().slice(0,10);
  const yesterday=snapshot?.days?.find((d:Json)=>d.date===previousDate);
  const lastRevenue=p.revenue.months?.at(-1);
  // Search Console roz ka data: 28-day total giravat chhupa deta hai, isliye din-wise dikhao
  const gsc=Boolean(report?.sources?.gsc);
  const searchDays=gsc?(report?.trend??[]).filter((d:Json)=>typeof d?.date==="string").slice(-14).reverse():[];
  const drop=gsc?searchDrop(report?.trend):null;
  const week=searchDays.slice(0,7).reduce((s:number,d:Json)=>s+(Number(d.impressions)||0),0);
  const maxImpressions=Math.max(1,...searchDays.map((d:Json)=>Number(d.impressions)||0));
  const searchUntil=report?.trend?.at(-1)?.date?date(report.trend.at(-1).date):null;
  const badges:Record<string,{count?:number;warn?:boolean}>={work:{count:ownerTasks.length},search:{warn:Boolean(drop)},overview:{warn:status.kind==="problem"||status.stale}};

  const searchDaily=<Panel title="Google search: roz kitni baar dikhe?">{drop&&<p role="alert" className="mb-4 rounded-xl border border-sun-300 bg-sun-100/50 p-4 text-sm text-ink">{drop.kind==="zero"?`Aakhri ${drop.zeroDays} din impressions zero hain.`:"Impressions pichhle hafte se aadhe se kam hain."} Pichhle 7 din: {number(drop.recent)}, usse pehle: {number(drop.before)}. &quot;Zaroori kaam&quot; mein check karne ke steps hain.</p>}<p className="mb-4 text-sm text-muted">Search Console data 2–3 din der se aata hai, isliye aakhri din adhoora ho sakta hai. Bar ki lambai impressions dikhati hai.</p>{searchDays.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-muted"><th className="py-3">Din</th><th className="py-3">Impressions</th><th className="py-3 text-right">Clicks</th></tr></thead><tbody>{searchDays.map((d:Json)=><tr key={d.date} className="border-b border-line"><td className="py-3 whitespace-nowrap">{date(d.date)}</td><td className="py-3"><div className="flex items-center gap-3"><span aria-hidden="true" className="block h-2 w-24 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:w-40"><span className="block h-full rounded-full bg-ivy-500" style={{width:`${(Number(d.impressions)||0)>0?Math.max(3,(Number(d.impressions)||0)/maxImpressions*100):0}%`}}/></span><span className="font-semibold">{number(d.impressions)}</span></div></td><td className="py-3 text-right font-semibold">{number(d.clicks)}</td></tr>)}</tbody></table></div>:<p className="text-sm text-muted">Search Console ka daily data abhi report mein nahi hai.</p>}</Panel>;
  const trafficCards=<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Aaj ke visits" value={number(day?.visits)} note={day?`Raat 12 baje se · ${freshTraffic?"latest reading":"saved reading"}`:"Connection ke baad yahan dikhenge"}/><Metric title="Aaj ke page views" value={number(day?.pageviews)} note="Ek visit mein kai pages khul sakte hain"/><Metric title="Kal ke visits" value={number(yesterday?.visits)} note={yesterday?date(previousDate)+" · poora din":"Kal ka data available nahi"}/><Metric title="Kal ke page views" value={number(yesterday?.pageviews)} note="India time · midnight se midnight"/></div>;
  const trafficNotice=!snapshot?<div role="status" className="rounded-xl border border-sun-300 bg-sun-100/40 p-4 text-sm text-ink"><p className="font-semibold">Daily visits ki read-only connection abhi poori nahi hui.</p><p className="mt-1">Iska matlab zero visitors nahi. Tab tak neeche se sahi Pages report kholein; host filter homemoneycalc.com rakhein.</p><a className="mt-2 inline-block font-semibold underline" href={ANALYTICS_DASHBOARD} target="_blank" rel="noopener noreferrer">Cloudflare report kholein ↗</a><details className="mt-3"><summary className="cursor-pointer font-semibold">Ek baar ka setup</summary><ol className="mt-2 list-decimal space-y-2 pl-5"><li>Existing Cloudflare account ke liye sirf Account Analytics Read access chahiye; paid upgrade nahi.</li><li>Token ko sirf private admin project ke CLOUDFLARE_WEB_ANALYTICS_TOKEN secret mein rakhein.</li><li>Sahi account aur Pages property code mein selected hain. Secret token chat mein paste na karein.</li><li>Connection verify hone par cards aur daily table khud update honge.</li></ol></details></div>:<p role="status" className="text-xs leading-relaxed text-muted">Traffic reading: {time(snapshot.checkedAt)} · {freshTraffic?"Open panel har 5 minute refresh hota hai.":"Ye saved reading hai; current total ke liye live connection verify karein."} Source: Cloudflare Web Analytics (browser activity). Visits repeat ho sakte hain. Known bots filter hote hain; browser blocking aur sampling se count kam ho sakta hai.</p>;
  const current=NAV.find(n=>n.id===view)??NAV[0];

  return <div data-owner-dashboard className="min-h-screen bg-bg"><style>{`body>header,body>footer,[data-install-prompt]{display:none!important}main#main{display:block}`}</style>
    <div className="mx-auto max-w-7xl gap-6 p-4 sm:p-6 lg:flex">
      {/* LEFT: menu. Desktop pe sticky sidebar, mobile pe upar 2-column buttons */}
      <aside className="lg:w-64 lg:shrink-0">
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold text-ivy-700 dark:text-ivy-300">HomeMoney Calc</p>
            <p className="text-xs text-muted">Owner panel · sirf aapke liye</p>
          </div>
          <nav aria-label="Admin menu" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
            {NAV.map(n=>{const b=badges[n.id];const active=view===n.id;return <button key={n.id} type="button" aria-pressed={active} onClick={()=>open(n.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${active?"border-ivy-700 bg-ivy-700 text-white":"border-line bg-surface text-ink hover:border-ivy-400"}`}>
              <Icon name={n.icon} className="h-4 w-4 shrink-0"/><span className="min-w-0 flex-1">{n.label}</span>
              {b?.count?<span aria-hidden="true" className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[11px] font-bold ${active?"bg-white text-ivy-700":"bg-ivy-600 text-white"}`}>{b.count}</span>:null}
              {b?.warn?<span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-sun-500"/>:null}
            </button>;})}
          </nav>
          {/* Mobile pe compact (ek line), desktop pe poora box */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface p-3 text-xs leading-relaxed text-muted lg:block lg:p-4">
            <p className="min-w-0 flex-1">Report: <strong className="text-ink">{time(report?.generatedAt)}</strong><span className="hidden lg:inline"><br/>{connection==="connected"?"Latest saved report connected":"Saved report"} · {p.tools.filter(t=>t.date<=today).length} calculators live</span></p>
            <div className="flex flex-wrap gap-2 lg:mt-3 lg:flex-col">
              <button className="btn-primary px-3 py-1.5 text-sm lg:px-5 lg:py-2.5" disabled={busy} onClick={()=>setRefreshKey(k=>k+1)}>{busy?"Update dekh rahe hain…":"Abhi refresh karein"}</button>
              <a href={p.siteUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost hidden text-sm lg:inline-flex">Website dekhein ↗</a>
            </div>
            <p className="hidden lg:mt-3 lg:block"><span aria-hidden="true" className="mr-1 inline-block h-2 w-2 rounded-full bg-sun-500"/>Peela dot = dekhne layak baat. Number = aapke pending kaam.</p>
          </div>
        </div>
      </aside>

      {/* RIGHT: chuna hua section */}
      <div className="mt-6 min-w-0 flex-1 lg:mt-0">
        <header id="admin-section" className="scroll-mt-3 border-b border-line pb-4"><h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{current.label}</h1><p className="mt-1 text-sm text-muted">{current.hint}</p></header>
        <div className="mt-5 space-y-5">
          {status.stale&&<p role="alert" className="rounded-xl border border-sun-300 bg-sun-100/50 p-4 text-sm text-ink">Report purani ya missing hai. Neeche ke checks ko aaj ka result na maanein. Zaroori kaam mein report refresh ke steps hain.</p>}

          {view==="overview"&&<>
            <section className={`rounded-2xl border p-5 sm:p-6 ${status.kind==="problem"?"border-sun-300 bg-sun-100/40":"border-line bg-surface"}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted">Website ka haal</p><h2 className="mt-2 text-xl font-bold text-ink">{status.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{status.explanation}</p><button className="mt-4 text-sm font-bold text-ivy-700 underline dark:text-ivy-300" onClick={()=>open("system")}>Checks ki details dekhein →</button></section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric title="Aaj ke visits" value={number(day?.visits)} note={day?`Raat 12 baje se · ${freshTraffic?"latest reading":"saved reading"}`:"Connection ke baad yahan dikhenge"} onOpen={()=>open("traffic")}/>
              <Metric title="Kal ke visits" value={number(yesterday?.visits)} note={yesterday?date(previousDate)+" · poora din":"Kal ka data available nahi"} onOpen={()=>open("traffic")}/>
              <Metric title="Google: pichhle 7 din" value={gsc?number(week):"—"} note={drop?"Impressions gire hain. Check karein.":searchUntil?`Impressions · data ${searchUntil} tak`:"Search data abhi nahi"} onOpen={()=>open("search")} warn={Boolean(drop)}/>
              <Metric title="Aapke pending kaam" value={number(ownerTasks.length)} note={ownerTasks.length?"Steps ke saath list taiyaar hai":"Abhi aapke liye koi kaam nahi"} onOpen={()=>open("work")} warn={ownerTasks.length>0}/>
            </div>
            {trafficNotice}
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Aapko abhi kya karna hai?"><Tasks items={ownerTasks.slice(0,2)} empty="Report mein aapke liye abhi koi action nahi. Daily checking automatic chalti rahegi; unknown checks alag dikhte hain."/>{ownerTasks.length>2&&<button className="mt-3 text-sm font-semibold underline" onClick={()=>open("work")}>Saare {ownerTasks.length} kaam dekhein →</button>}</Panel>
              <Panel title="Aaj ka share draft"><p className="text-sm leading-relaxed text-muted">Roz naya Pinterest pin aur email draft banta hai. Copy karein, thoda apne shabdon mein badlein, phir khud post karein.</p><button className="mt-4 btn-primary text-sm" onClick={()=>open("share")}>Drafts kholein →</button></Panel>
            </div>
            <Panel title="AdSense se earning"><p className="text-lg font-bold text-ink">Abhi apply hold par hai</p><p className="mt-2 text-sm leading-relaxed text-muted">Pehle useful website, verified calculations aur genuine traffic. Application aur ads aapke decision ke bina start nahi honge.</p><p className="mt-4 text-sm text-muted">Recorded earning: <strong className="text-ink">{typeof lastRevenue?.total==="number"?"$"+number(lastRevenue.total)+" · "+lastRevenue.month:"Abhi koi earning record nahi joda"}</strong></p><button className="mt-4 text-sm font-semibold underline" onClick={()=>open("earning")}>Taiyaari ke steps dekhein →</button></Panel>
          </>}

          {view==="traffic"&&<>
            {trafficCards}{trafficNotice}
            <Panel title="Roz kitne visits aur page views aaye?"><p className="mb-4 text-sm text-muted">India time. Aaj ka count upar diye reading time tak ka hai. “0” ka matlab us reading mein koi visit record nahi hua. “—” ka matlab data missing hai. Cloudflare Overview ke Unique Visitors aur Requests alag counters hain.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-muted"><th className="py-3">Din</th><th className="py-3 text-right">Visits</th><th className="py-3 text-right">Page views</th></tr></thead><tbody>{(snapshot?.days??[]).slice().reverse().map((d:Json)=><tr key={d.date} className="border-b border-line"><td className="py-3">{date(d.date)} {d.date===today?"· aaj, ab tak":""}</td><td className="py-3 text-right font-semibold">{number(d.visits)}</td><td className="py-3 text-right font-semibold">{number(d.pageviews)}</td></tr>)}</tbody></table>{!snapshot&&<p className="py-5 text-muted">Connection verify hone par dated rows yahan aa jayengi.</p>}</div></Panel>
            <div className="grid gap-5 lg:grid-cols-2"><Panel title="Kaunse pages zyada khule?"><ul className="space-y-3 text-sm">{snapshot?.pages?.map((s:Json)=><li key={s.path} className="flex justify-between gap-3"><span className="break-all text-muted">{s.path}</span><strong>{number(s.pageviews)}</strong></li>)}</ul>{!snapshot?.pages?.length&&<p className="text-sm text-muted">Abhi page breakdown nahi mila.</p>}</Panel><Panel title="Visits kahan se aaye?"><ul className="space-y-3 text-sm">{snapshot?.sources?.map((s:Json)=><li key={s.host} className="flex justify-between gap-3"><span className="break-all text-muted">{s.host||"Direct / source nahi mila"}</span><strong>{number(s.visits)}</strong></li>)}</ul>{!snapshot?.sources?.length&&<p className="text-sm text-muted">Abhi source breakdown nahi mila.</p>}</Panel></div>
          </>}

          {view==="search"&&<>
            {/* Mobile pe bhi teeno ek line mein */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[{t:"Clicks",v:number(gsc?report.kpis?.clicks:null),n:"Google se aaye log"},{t:"Impressions",v:number(gsc?report.kpis?.impressions:null),n:"Results mein kitni baar dikhe"},{t:"Avg. position",v:decimal(gsc?report.kpis?.position:null),n:"1–10 = pehla page"}].map(s=><div key={s.t} className="min-w-0 rounded-2xl border border-line bg-surface p-3 sm:p-5"><p className="text-xs font-medium text-muted sm:text-sm">{s.t}</p><p className="mt-1 break-words text-2xl font-extrabold tracking-tight text-ink sm:mt-3 sm:text-3xl">{s.v}</p><p className="mt-1 text-[11px] leading-snug text-muted sm:mt-2 sm:text-xs">{s.n}</p></div>)}
            </div>
            <p className="text-sm text-muted">Ye pichhle 28 din ke numbers hain, data {searchUntil?searchUntil+" tak":"abhi available nahi"}. Ye aaj ke visits ka total nahi hai.</p>
            {searchDaily}
            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Log kya search karke aaye?"><SearchTable rows={gsc?report?.topQueries:[]} label="Search words" pick={(r:Json)=>r.query}/></Panel>
              <Panel title="Kaunse pages Google mein dikhe?"><SearchTable rows={gsc?report?.topPages:[]} label="Page" pick={(r:Json)=>r.page}/></Panel>
            </div>
            <a className="inline-block text-sm font-semibold underline" href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Search Console kholein ↗</a>
          </>}

          {view==="work"&&<>
            <Panel title="Aapke zaroori steps"><Tasks items={ownerTasks} empty="Latest report mein aapke liye abhi koi action nahi."/>{connection==="setup-needed"&&<p className="mt-3 text-sm text-muted">Latest report ke liye private admin project mein GITHUB_REPORT_TOKEN ya existing GITHUB_AGENT_TOKEN configure karein. Tab tak saved report dikhega.</p>}</Panel>
            <details className="rounded-2xl border border-line bg-surface p-5"><summary className="cursor-pointer font-bold text-ink">Developer ke liye pending fixes ({agentTasks.length})</summary><div className="mt-4"><Tasks items={agentTasks} empty="Abhi koi confirmed source-code fix queue mein nahi."/></div></details>
            {growthTasks.length>0&&<Panel title="Growth suggestion"><Tasks items={growthTasks} empty=""/></Panel>}
            <details className="rounded-2xl border border-line bg-surface p-5"><summary className="cursor-pointer font-bold text-ink">Approvals aur research</summary><div className="mt-4 space-y-5"><ApprovalInbox initialQueue={p.approvalQueue} initialHistory={p.approvalHistory}/><ResearchMonitor data={p.research}/></div></details>
          </>}

          {view==="share"&&<>
            <Panel title="Share karne ke drafts (aap khud post karein)"><ShareDrafts ideas={report?.ideas}/></Panel>
            <LinkReviewPanel plan={report?.linkReview ?? p.linkReview} repo={p.repo}/>
          </>}

          {view==="earning"&&<>
            <Panel title="Main goal: AdSense se earning"><p className="text-lg font-bold text-ink">Stage: website aur genuine traffic ki taiyaari</p><p className="mt-2 text-sm leading-relaxed text-muted">Ads abhi band hain. Google ki approval aur earning ki guarantee nahi hoti. 200 clicks ya 1,000 visitors hamara planning checkpoint ho sakta hai; Google ka fixed minimum rule nahi.</p><ol className="mt-5 space-y-3">{[{title:"Useful aur sahi content",text:"Calculators, examples aur tax-source reviews current rakhein. Known problems pehle fix hon."},{title:"Genuine visitors",text:"Visits aur search clicks follow karein. Fake traffic, bought visits ya apne ads par clicks kabhi nahi."},{title:"Aapka final review",text:"Aap jab kahenge tab AdSense application ki final review karenge. Apply abhi hold par hai."},{title:"Google account aur privacy setup",text:"Publisher ID, ownership verification, applicable privacy messages aur ads.txt application/ad setup ke waqt verify honge."}].map((s,i)=><li key={s.title} className="rounded-xl bg-surface-2 p-4"><h3 className="font-bold text-ink">{i+1}. {s.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p></li>)}</ol></Panel>
            <Panel title="Users ko difficulty nahi honi chahiye"><ul className="list-disc space-y-2 pl-5 text-sm text-muted"><li>Calculator controls ke paas accidental-click wale ads nahi.</li><li>Popups, anchor/vignette ads aur forced first-visit analytics prompt nahi.</li><li>Reserved ad space; final mobile placement test ke baad activation.</li><li>Financial inputs ad requests mein leak na hon—final ad tag ke saath verification zaroori hai.</li></ul></Panel>
            <details className="rounded-2xl border border-line bg-surface p-5"><summary className="cursor-pointer font-bold text-ink">Account setup ki detailed checklist</summary><ul className="mt-4 space-y-3 text-sm text-muted">{p.monetization.accountChecks?.map((c:Json)=><li key={c.id}>{c.done?"✓":"○"} {c.label}</li>)}</ul></details>
          </>}

          {view==="system"&&<>
            <Panel title="Automatic kya hota hai?"><ul className="space-y-3 text-sm text-muted"><li>✓ SEO report run hone par tests, technical audit, security checks aur search data update hote hain.</li><li>✓ Connected admin latest saved report khud padhta hai.</li><li>✓ Open panel mein connected visits har 5 minute refresh.</li><li>✓ Google impressions achanak girein to &quot;Zaroori kaam&quot; mein alert aata hai.</li><li>✓ Tax-source review ki due dates aur naye year ka alert.</li><li>○ Code fixes ko verify aur publish karne ke liye coding workflow ya local coding session chahiye.</li><li>○ AdSense application, account permissions aur final decisions aapke control mein hain.</li></ul></Panel>
            <details className="rounded-2xl border border-line bg-surface p-5"><summary className="cursor-pointer font-bold text-ink">Technical details aur connection status</summary><p className="mt-3 text-sm text-muted">Report: {connection} · Visits: {trafficConnection}. Private key/password chat mein paste na karein.</p><pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-4 text-xs text-muted">{JSON.stringify({quality:report?.quality,live:report?.liveChecks,tax:report?.taxReview,notes:report?.notes},null,2)}</pre><a className="mt-3 inline-block text-sm font-semibold underline" href={`${p.repo}/actions`} target="_blank" rel="noopener noreferrer">GitHub automatic checks dekhein ↗</a><p className="mt-3 text-xs text-muted">Latest report ko bina redeploy padne ke liye private admin project mein read-only GITHUB_REPORT_TOKEN chahiye; existing GITHUB_AGENT_TOKEN bhi use ho sakta hai.</p></details>
            <Panel title="Aane wale calculators"><ul className="space-y-2 text-sm text-muted">{p.tools.filter(t=>t.date>today).map(t=><li key={t.slug} className="flex justify-between gap-3"><span>{t.title}</span><strong className="text-ink">{date(t.date)}</strong></li>)}</ul>{!p.tools.some(t=>t.date>today)&&<p className="text-sm text-muted">Queue mein koi calculator nahi.</p>}</Panel>
            <Panel title="Account safety ke baaki kaam"><ul className="space-y-3 text-sm text-muted">{p.security.filter(s=>!s.done).map(s=><li key={s.task}>○ {s.task}</li>)}</ul>{!p.security.some(s=>!s.done)&&<p className="text-sm text-muted">Checklist ke saare kaam done hain.</p>}</Panel>
          </>}

          {view==="help"&&<HelpGuide repo={p.repo} open={open}/>}
        </div>
        <footer className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-muted">Private owner panel · Missing data ko zero nahi maante · Last reading ki date hamesha dekhein</footer>
      </div>
    </div>
  </div>;
}

// Google queries/pages ki chhoti table (top 10)
function SearchTable({rows,label,pick}:{rows:Json[];label:string;pick:(r:Json)=>string}) {
  const list=(Array.isArray(rows)?rows:[]).slice(0,10);
  if(!list.length) return <p className="text-sm text-muted">Abhi data nahi mila.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-muted"><th className="py-2 pr-3">{label}</th><th className="py-2 text-right">Dikhe</th><th className="py-2 text-right">Clicks</th><th className="py-2 text-right">Position</th></tr></thead><tbody>{list.map((r:Json)=><tr key={pick(r)} className="border-b border-line"><td className="break-all py-2 pr-3 text-ink">{pick(r)}</td><td className="py-2 text-right">{number(r.impressions)}</td><td className="py-2 text-right">{number(r.clicks)}</td><td className="py-2 text-right">{decimal(r.position)}</td></tr>)}</tbody></table></div>;
}

// Panel ke andar chhoti guide. Poori guide: docs/ADMIN-GUIDE.md
function HelpGuide({repo,open}:{repo:string;open:(id:string)=>void}) {
  const steps:{id:string;title:string;text:string}[]=[
    {id:"overview",title:"Roz 1 minute: Aaj ka haal",text:"Upar wala box batata hai ki checks theek hain ya nahi. Peela rang ho to dhyan dein. Neeche ke 4 boxes pe click karke us section mein seedha ja sakte hain."},
    {id:"work",title:"Zaroori kaam",text:"Menu mein number dikhe to aapke liye kaam hai. Har kaam ke 'Steps dekhein' mein 1-2-3 steps hain. Developer wale fixes aapko khud nahi karne."},
    {id:"search",title:"Hafte mein 1 baar: Google Search",text:"Roz ki table mein dekhein ki impressions badh rahe hain ya gir rahe hain. Aakhri 2–3 din adhoore ho sakte hain, unse ghabrayein nahi."},
    {id:"share",title:"Share & Promotion",text:"Draft ka 'Copy' dabayein, apne shabdon mein thoda badlein, link khol ke check karein, phir apne account se post karein. Yahan se kuch apne aap post nahi hota."},
    {id:"traffic",title:"Visits",text:"Cloudflare se aaj aur kal ke visitors. '—' ka matlab data nahi mila, zero visitors nahi."},
    {id:"earning",title:"AdSense",text:"Abhi sirf taiyaari. Apply aap ke kehne par hi hoga. Apne ads pe khud click kabhi na karein."},
  ];
  return <div className="space-y-5">
    <Panel title="Panel kaise use karein"><ol className="space-y-3">{steps.map((s,i)=><li key={s.id} className="rounded-xl bg-surface-2 p-4"><h3 className="font-bold text-ink">{i+1}. {s.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p><button className="mt-2 text-sm font-semibold text-ivy-700 underline dark:text-ivy-300" onClick={()=>open(s.id)}>Ye section kholein →</button></li>)}</ol></Panel>
    <Panel title="Kya kabhi nahi karna"><ul className="list-disc space-y-2 pl-5 text-sm text-muted"><li>Password, API key ya token chat ya message mein paste na karein.</li><li>Backlinks ya traffic kharidna nahi. Isse Google penalty laga sakta hai.</li><li>Roz-roz website mein bade badlav na karwayein. Ek badlav karke 2–4 hafte result dekhein.</li><li>Ek hi text har jagah copy-paste na karein. Har post thodi alag rakhein.</li></ul></Panel>
    <a className="inline-block text-sm font-semibold underline" href={`${repo}/blob/main/docs/ADMIN-GUIDE.md`} target="_blank" rel="noopener noreferrer">Poori guide padhein ↗</a>
  </div>;
}
