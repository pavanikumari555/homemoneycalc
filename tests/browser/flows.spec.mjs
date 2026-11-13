import { test, expect } from "@playwright/test";
const admin=process.env.BROWSER_ADMIN==="1";

test("loan comparisons work by keyboard and input guidance is announced",async({page})=>{
  test.skip(admin);
  await page.goto("/auto-loan-calculator/");
  const compare=page.getByRole("button",{name:"Compare 36 month loan",exact:true});
  await compare.focus();await page.keyboard.press("Enter");
  await expect(page.getByLabel("Loan length",{exact:true})).toHaveValue("36");
  await expect(compare).toHaveAttribute("aria-pressed","true");
  await page.goto("/credit-card-payoff-calculator/");
  await expect(page.getByLabel("APR (interest rate)",{exact:true})).toHaveAccessibleDescription("Find it on your statement");
});

test("first visit never shows a timed or calculation-triggered install overlay",async({page})=>{
  test.skip(admin);
  await page.clock.install();
  await page.goto("/mortgage-payoff-calculator/");
  await expect(page.getByLabel("Remaining balance",{exact:true})).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new Event("hmc_calculation_complete")));
  await page.clock.fastForward(61000);
  await expect(page.getByRole("region",{name:"App installation prompt"})).toHaveCount(0);
  await expect(page.locator("[data-install-prompt]")).toHaveCount(0);
});

test("returning installable visitors retain one working install prompt",async({page})=>{
  test.skip(admin);
  await page.addInitScript(()=>{
    localStorage.setItem("hmc:visits","2");
    window.addEventListener("DOMContentLoaded",()=>{
      const install=new Event("beforeinstallprompt",{cancelable:true});
      install.prompt=async()=>{window.__installPromptCalled=true;};
      window.dispatchEvent(install);
    });
  });
  await page.goto("/mortgage-payoff-calculator/");
  await expect(page.locator("[data-install-prompt]")).toHaveCount(1);
  await page.getByRole("button",{name:"Install",exact:true}).click();
  expect(await page.evaluate(()=>window.__installPromptCalled)).toBe(true);
  await expect(page.locator("[data-install-prompt]")).toHaveCount(0);
});

test("mobile result shortcut respects reduced motion and transfers keyboard focus",async({page},testInfo)=>{
  test.skip(admin || testInfo.project.name!=="mobile");
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/mortgage-payoff-calculator/");
  await page.getByLabel("Remaining balance",{exact:true}).scrollIntoViewIfNeeded();
  const shortcut=page.getByRole("button",{name:/Details ↓/});
  await expect(shortcut).toBeVisible();
  await page.evaluate(()=>{
    const scroll=Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView=function(options){
      window.__resultScrollBehavior=options?.behavior;
      return scroll.call(this,options);
    };
  });
  await shortcut.focus();await page.keyboard.press("Enter");
  await expect(page.getByRole("region",{name:"Calculation results",exact:true})).toBeFocused();
  expect(await page.evaluate(()=>window.__resultScrollBehavior)).toBe("instant");
});

test("private growth review shows at most two research cards and read-only drafts",async({page})=>{
  test.skip(!admin);
  await page.route("**/admin/api/report",r=>r.fulfill({status:503,json:{status:"setup-needed"}}));
  await page.route("**/admin/api/traffic",r=>r.fulfill({status:503,json:{status:"setup-needed",connected:false}}));
  await page.goto("/admin/");await page.getByRole("button",{name:"Share & Promotion",exact:true}).click();
  await page.getByText("Safe growth: resource review (2/2)",{exact:true}).click();
  await expect(page.getByRole("heading",{name:"Jumpstart Clearinghouse",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"University of Minnesota Extension",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"FDIC Money Smart",exact:true})).toHaveCount(0);
  await page.getByText("Inquiry draft review karein",{exact:true}).first().click();
  const draft=page.getByRole("textbox",{name:"Jumpstart Clearinghouse inquiry draft"});
  await expect(draft).toHaveAttribute("readonly","");
  await expect(draft).toHaveValue(/Do you accept suggestions/);
  await expect(page.getByRole("button",{name:/^Send/})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test("new overtime tool switches tax years/status and restores the selected year",async({page})=>{
  test.skip(admin);
  await page.goto("/no-tax-on-overtime-calculator/?m=premium&p=5000&i=66500&f=single&y=2026");
  const savings=page.getByRole("row").filter({hasText:"Federal income tax saved"});
  await expect(savings).toContainText("$600.00");
  await page.getByLabel("Tax year",{exact:true}).selectOption("2025");
  await expect(savings).toContainText("$827.50");
  await expect(page).toHaveURL(/y=2025/);
  await page.reload();await expect(page.getByLabel("Tax year",{exact:true})).toHaveValue("2025");
  await page.getByLabel("Tax year",{exact:true}).selectOption("2026");
  await page.getByLabel("Modified adjusted gross income (MAGI)",{exact:true}).fill("70000");
  await page.getByLabel("Filing status",{exact:true}).selectOption("hoh");
  await expect(savings).toContainText("$600.00");
  await expect(page.getByText(/Pay stubs alone do not replace that reporting/)).toBeVisible();
  await page.getByLabel("Filing status",{exact:true}).selectOption("mfs");
  await expect(savings).toContainText("$0.00");
});

test("percentage multiplier example opens the exact interactive scenario",async({page})=>{
  test.skip(admin);await page.goto("/percentage-calculator/");
  await page.getByRole("link",{name:"Try 110 increased by 6% in the calculator"}).click();
  await expect(page.getByLabel("Starting number",{exact:true})).toHaveValue("110");
  await expect(page.getByLabel("Increase percent",{exact:true})).toHaveValue("6");
  await expect(page.getByText("116.6",{exact:true}).first()).toBeVisible();
});

test("owner panel keeps saved visits but surfaces a current query failure",async({page})=>{
  test.skip(!admin);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const report={date:today,generatedAt:new Date().toISOString(),sources:{gsc:true},health:{ran:true,errors:0},quality:[{status:"pass"}],liveChecks:[{status:"pass"}],traffic:{connected:true,status:"connected",checkedAt:new Date().toISOString(),days:[{date:today,visits:7,pageviews:9}],pages:[],sources:[]}};
  await page.route("**/admin/api/report",r=>r.fulfill({json:{status:"connected",report}}));
  await page.route("**/admin/api/traffic",r=>r.fulfill({status:503,json:{connected:false,status:"query-unsupported"}}));
  await page.goto("/admin/");
  await expect(page.getByText(/Ye saved reading hai/)).toBeVisible();
  await page.getByRole("button",{name:"Zaroori kaam",exact:true}).click();
  await page.getByText(/Developer ke liye pending fixes/).click();
  await expect(page.getByText("Daily visits connection ka error verify karein",{exact:true})).toBeVisible();
  await expect(page.getByText("Daily visits ka ek baar connection poora karein",{exact:true})).toHaveCount(0);
});
test.beforeEach(async({page})=>{
  // Tests run on localhost, never on production and never generate visitor/ad events.
  await page.route(/cloudflareinsights|googlesyndication|google-analytics|googletagmanager/,r=>r.abort());
});
test("multiword search opens the matching calculator",async({page})=>{
  test.skip(admin);
  await page.goto("/");await page.getByRole("searchbox",{name:"Search calculators"}).fill("car loan");
  await page.getByRole("searchbox",{name:"Search calculators"}).press("Enter");
  await expect(page).toHaveURL(/auto-loan-calculator/);
  await expect(page.getByRole("heading",{level:1})).toContainText(/Auto|Car/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test("a saved mortgage plan survives reload with its exact inputs",async({page})=>{
  test.skip(admin);
  await page.goto("/mortgage-payoff-calculator/");await page.getByLabel("Remaining balance",{exact:true}).fill("123456");
  await page.getByRole("button",{name:"Save this plan",exact:true}).click();
  await page.getByPlaceholder(/Name it/).fill("Browser regression plan");
  await page.getByRole("button",{name:"Save",exact:true}).click();
  await expect(page.getByRole("button",{name:"Browser regression plan",exact:true})).toBeVisible();
  await page.reload();await page.getByRole("button",{name:"Browser regression plan",exact:true}).click();
  await expect(page.getByLabel("Remaining balance",{exact:true})).toHaveValue("123456");
});
test("public export excludes the owner report",async({request})=>{
  test.skip(admin);const r=await request.get("/admin/");expect(r.status()).toBe(404);expect(await r.text()).not.toContain("data-owner-dashboard");
});
test("single and joint state tax UI renders the corrected South Carolina result",async({page})=>{
  test.skip(admin);
  await page.goto("/paycheck-calculator/");await page.getByLabel("Annual salary (gross)",{exact:true}).fill("100000");
  await page.getByLabel("State you work in",{exact:true}).selectOption("SC");
  await page.getByLabel("401(k) contribution",{exact:true}).fill("0");
  await page.getByLabel("Health, dental & other pre-tax",{exact:true}).fill("0");
  await page.getByText("Per year",{exact:true}).click();
  await expect(page.getByRole("row").filter({hasText:"South Carolina income tax"})).toContainText("4,244");
});
test("owner panel shows daily visits and simple navigation without historical GA4 cards",async({page})=>{
  test.skip(!admin);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const report={date:today,generatedAt:new Date().toISOString(),sources:{gsc:true},health:{ran:true,errors:0},quality:[{status:"pass"}],liveChecks:[{status:"pass"}],kpis:{clicks:2,impressions:200},trend:[]};
  await page.route("**/admin/api/report",r=>r.fulfill({json:{status:"connected",report}}));
  await page.route("**/admin/api/traffic",async r=>{
    // A real server timestamps its reading after the browser starts refreshing.
    await new Promise(resolve=>setTimeout(resolve,100));
    await r.fulfill({json:{connected:true,status:"connected",checkedAt:new Date().toISOString(),days:[{date:today,visits:7,pageviews:15,partial:true}],pages:[],sources:[]}});
  });
  await page.goto("/admin/");await expect(page.getByRole("navigation",{name:"Admin menu"}).getByRole("button")).toHaveCount(8);
  await expect(page.getByText("Raat 12 baje se · latest reading",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Visits",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Roz kitne visits aur page views aaye?"})).toBeVisible();
  await expect(page.getByRole("row").filter({hasText:"aaj, ab tak"})).toContainText("15");
  await expect(page.getByText("Historical GA4 sample")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole("button",{name:"AdSense",exact:true}).click();await expect(page.getByRole("heading",{name:"Main goal: AdSense se earning"})).toBeVisible();
});

test("owner panel sidebar opens Google Search, share drafts and the guide without overflow",async({page})=>{
  test.skip(!admin);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const trend=Array.from({length:12},(_,i)=>({date:new Date(Date.UTC(2026,10,1+i)).toISOString().slice(0,10),clicks:0,impressions:i<10?100:0}));
  const report={date:today,generatedAt:new Date().toISOString(),sources:{gsc:true},health:{ran:true,errors:0},quality:[{status:"pass"}],liveChecks:[{status:"pass"}],kpis:{clicks:3,impressions:1000,position:31.3},trend,
    topQueries:[{query:"holiday budget calculator",clicks:0,impressions:40,position:7.6}],topPages:[{page:"/holiday-budget-calculator/",clicks:0,impressions:97,position:7.9}],
    ideas:{social:{pinterest:{title:"Test pin title",description:"Test pin description",board:"Money Tips",link:"https://homemoneycalc.com/tip-calculator/",design:"Tall pin"}},outreach:[],seasonal:[]}};
  await page.route("**/admin/api/report",r=>r.fulfill({json:{status:"connected",report}}));
  await page.route("**/admin/api/traffic",r=>r.fulfill({status:503,json:{connected:false,status:"setup-needed"}}));
  await page.goto("/admin/");
  await page.getByRole("button",{name:"Google Search",exact:true}).click();
  await expect(page.getByRole("heading",{level:1,name:"Google Search"})).toBeVisible();
  await expect(page.getByRole("alert").filter({hasText:"Aakhri 2 din impressions zero hain."})).toBeVisible();
  await expect(page.getByRole("row").filter({hasText:"holiday budget calculator"})).toContainText("7.6");
  await page.getByRole("button",{name:"Share & Promotion",exact:true}).click();
  await expect(page.getByText(/Test pin title/).first()).toBeVisible();
  await expect(page.getByRole("button",{name:/^(Post|Send|Publish)/})).toHaveCount(0);
  await page.getByRole("button",{name:"Madad (Guide)",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Panel kaise use karein"})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test("global search fits the viewport and provides a keyboard and touch exit",async({page})=>{
  test.skip(admin);
  await page.goto("/mortgage-payoff-calculator/");
  const trigger=page.getByRole("button",{name:"Search calculators",exact:true});
  await trigger.click();
  const dialog=page.getByRole("dialog",{name:"Search calculators"});
  await expect(dialog).toBeVisible();
  const box=await dialog.boundingBox(), viewport=page.viewportSize();
  expect(box.y).toBeGreaterThan(64); expect(box.y+box.height).toBeLessThanOrEqual(viewport.height);
  const input=dialog.getByRole("combobox"); await expect(input).toBeFocused();
  await input.press("Control+k"); await expect(input).toBeFocused();
  await input.press("Tab"); await expect(dialog.getByRole("button",{name:"Close search"})).toBeFocused();
  await page.keyboard.press("Tab"); await expect(input).toBeFocused();
  await input.press("Escape"); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
  await trigger.click(); await page.getByRole("button",{name:"Close search"}).click(); await expect(dialog).toHaveCount(0);
  for(const width of [320,390,768]) {
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await expect(trigger).toBeVisible();
  }
  await page.setViewportSize({width:667,height:320});
  await trigger.click();
  const landscape=await dialog.boundingBox();
  expect(landscape.y+landscape.height).toBeLessThanOrEqual(320);
  await page.getByRole("button",{name:"Close search"}).click();
});

test("calculator navigation has a mobile name and restores focus on Escape",async({page})=>{
  test.skip(admin);await page.goto("/");
  const trigger=page.getByRole("button",{name:"Calculators",exact:true});
  await trigger.click();await expect(trigger).toHaveAttribute("aria-expanded","true");
  await page.locator("#calculator-navigation").getByRole("link").first().focus();
  await page.keyboard.press("Escape");await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded","false");
});

test("My Money reports blocked deletion without losing a stored plan",async({page})=>{
  test.skip(admin);
  await page.addInitScript(()=>{
    localStorage.setItem("hmc:saved:mortgage-payoff-calculator",JSON.stringify([{id:"p1",name:"Keep this plan",savedAt:1,values:{b:"123456"}}]));
    Storage.prototype.setItem=function(){throw new DOMException("Blocked","QuotaExceededError");};
  });
  await page.goto("/my-money/");await page.getByRole("button",{name:"Delete Keep this plan"}).click();
  await expect(page.getByRole("alert").filter({hasText:"could not be deleted"})).toBeVisible();
  await expect(page.getByText("Keep this plan",{exact:true})).toBeVisible();
});

test("owner panel uses live traffic status and displays setup errors from 503 JSON",async({page})=>{
  test.skip(!admin);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const report={date:today,sources:{gsc:true},health:{ran:true,errors:0},quality:[{status:"pass"}],liveChecks:[{status:"pass"}],traffic:{connected:false,status:"setup-needed"},kpis:{},trend:[]};
  let disconnected=false;
  await page.route("**/admin/api/report",r=>r.fulfill(disconnected?{status:503,json:{status:"setup-needed"}}:{json:{status:"connected",report}}));
  await page.route("**/admin/api/traffic",r=>r.fulfill(disconnected?{status:503,json:{connected:false,status:"permission-needed"}}:{json:{connected:true,status:"connected",checkedAt:new Date().toISOString(),days:[],pages:[],sources:[]}}));
  await page.goto("/admin/");
  await expect(page.getByRole("button",{name:"Abhi refresh karein",exact:true})).toBeEnabled();
  await page.getByRole("button",{name:"Zaroori kaam",exact:true}).click();
  await expect(page.getByText("Daily visits ka ek baar connection poora karein",{exact:true})).toHaveCount(0);
  disconnected=true;
  await page.getByRole("button",{name:"Abhi refresh karein",exact:true}).click();
  await expect(page.getByText("Daily visits ka ek baar connection poora karein",{exact:true})).toBeVisible();
  await expect(page.getByText(/Latest report ke liye private admin project/)).toBeVisible();
});

test("every sitemap page renders without runtime errors or horizontal overflow",async({page,request})=>{
  test.skip(admin);test.setTimeout(120000);
  const sitemap=await request.get("/sitemap.xml");expect(sitemap.ok()).toBe(true);
  const paths=[...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  expect(paths.length).toBeGreaterThan(20);
  const errors=[];page.on("pageerror",error=>errors.push({path:new URL(page.url()).pathname,message:error.message}));
  for(const path of paths){
    const response=await page.goto(path);expect(response.status(),path).toBe(200);
    await page.waitForLoadState("networkidle");
    // Exercise hydration before navigating away; network idle alone is not readiness.
    const search=page.getByRole("button",{name:"Search calculators",exact:true});
    await search.click();await page.getByRole("button",{name:"Close search",exact:true}).click();
    await expect(search).toBeFocused();
    await expect(page.getByRole("heading",{level:1}),path).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),path).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("storage-disabled visitors can still use calculator controls",async({page})=>{
  test.skip(admin);
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.addInitScript(()=>{
    Storage.prototype.getItem=function(){throw new DOMException("Blocked","SecurityError");};
    Storage.prototype.setItem=function(){throw new DOMException("Blocked","SecurityError");};
  });
  await page.goto("/mortgage-payoff-calculator/");await page.waitForLoadState("networkidle");
  const balance=page.getByLabel("Remaining balance",{exact:true});
  await balance.fill("123456");await expect(balance).toHaveValue("123456");
  await page.getByRole("button",{name:"Switch to dark mode",exact:true}).click();
  await expect(page.getByRole("button",{name:"Switch to light mode",exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
