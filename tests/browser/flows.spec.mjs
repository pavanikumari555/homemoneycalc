import { test, expect } from "@playwright/test";
const admin=process.env.BROWSER_ADMIN==="1";
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
  await page.goto("/admin/");await expect(page.getByRole("navigation",{name:"Admin menu"}).getByRole("button")).toHaveCount(4);
  await expect(page.getByText("Raat 12 baje se · latest reading",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Visits",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Roz kitne visits aur page views aaye?"})).toBeVisible();
  await expect(page.getByRole("row").filter({hasText:"aaj, ab tak"})).toContainText("15");
  await expect(page.getByText("Historical GA4 sample")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole("button",{name:"AdSense",exact:true}).click();await expect(page.getByRole("heading",{name:"Main goal: AdSense se earning"})).toBeVisible();
});
