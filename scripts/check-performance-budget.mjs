// Local asset budgets catch regressions without loading production ads/beacons.
// This is a build-size guard, not a real-user performance score.
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, resolve, relative, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
export function performanceBudget(root="out") {
  const base=resolve(root),results=[];
  for(const page of ["index.html","paycheck-calculator/index.html","debt-payoff-calculator/index.html"]){
    const file=join(base,page);
    if(!existsSync(file)){results.push({page,status:"unknown",reason:"Export missing"});continue;}
    const html=readFileSync(file,"utf8");
    const assets=[...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+\.(?:js|css))"/g)].map(m=>m[1]))];
    let js=0,css=0,missing=false;
    for(const asset of assets){
      const path=resolve(base,"."+asset),rel=relative(base,path);
      if(rel.startsWith("..")||isAbsolute(rel)||!existsSync(path)){missing=true;continue;}
      const size=gzipSync(readFileSync(path)).length;if(asset.endsWith(".js"))js+=size;else css+=size;
    }
    results.push({page,status:missing||!assets.length?"unknown":js>350*1024||css>100*1024?"fail":"pass",jsGzipBytes:js,cssGzipBytes:css});
  }
  return results;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=performanceBudget();console.log(JSON.stringify({kind:"local compressed asset budget, not field CWV",results:result},null,2));
  if(result.some(r=>r.status!=="pass"))process.exitCode=1;
}
