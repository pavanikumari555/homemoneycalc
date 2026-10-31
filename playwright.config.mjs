import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser", timeout: 30000, retries: process.env.CI ? 1 : 0,
  reporter: "list", use: { baseURL: "http://127.0.0.1:4173", serviceWorkers: "block" },
  projects: [ {name:"desktop",use:{browserName:"chromium",viewport:{width:1280,height:900}}}, {name:"mobile",use:{browserName:"chromium",viewport:{width:390,height:844},isMobile:true,hasTouch:true}} ],
  webServer: { command:"node scripts/serve-out.mjs 4173",url:"http://127.0.0.1:4173/",reuseExistingServer:!process.env.CI,timeout:30000 },
});
