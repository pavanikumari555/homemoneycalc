# HomeMoney Calc — Owner ka weekly SEO routine (human kaam)

**Kyun ye zaroori hai:** calculator site Google pe tab upar aati hai jab (1) pages sach me kaam ke hon aur (2) dusri asli sites unhe link karein. Pehla kaam code + agent karta hai. Doosra kaam **sirf insaan** kar sakta hai — aur wahi sabse zyada farak daalta hai. Agent kabhi post/email khud nahi bhejta; wo sirf drafts aur ideas deta hai (admin panel me).

Roz ~30–45 minute. Admin panel (`admin.<domain>/admin/`) me yahi list "Your weekly SEO routine" card me bhi hai.

## Hafte ka plan

| Din | Kaam | Kahan | Kyun |
|---|---|---|---|
| **Mon** | Admin panel padho. Agent ke PRs review karo — har tax/finance number official source (IRS, SSA, state site) se milao, tab hi merge | GitHub → Pull requests | Galat number = trust gaya. Google finance pages ko "YMYL" maanta hai — accuracy sabse zaroori |
| **Tue** | Reddit/Quora pe **2 genuine jawab**. Poora jawab text me likho; link sirf tab jab calculator sach me madad kare; "I built this free tool" bata do; subreddit ke rules padho | r/personalfinance, r/povertyfinance, r/Tipping, Quora money topics | Asli logon ki madad = brand + kuch visits. Link-drop spam = ban |
| **Wed** | Journalist platforms pe 2–3 sawaal ka jawab — jaldi (1 ghante me), ek unique number + 2 line method + exact page link | Qwoted, Featured.com, SourceBottle | News sites ke links sabse taakatwar hote hain, aur ye "earned" hain (allowed) |
| **Thu** | Admin ke **Outreach drafts** se 3–5 personalized emails — bloggers (state data study), teachers (embed widget) | Apna site wala Gmail | Ek achha blogger link = 100 directory links |
| **Fri** | Pinterest pe 2 pins, YouTube pe 1 Short — admin ka "Pinterest & Shorts idea" card | Canva (free) + Pinterest + YouTube | US me Pinterest money-tips ka bada search engine hai |
| **Monthly** | 1–2 genuine tool directories / resource pages; Search Console → Pages report; `data/revenue.json` me kamai update | — | Health check + kamai ka hisaab |

## Seasonal (admin "Season alerts" card batata hai)
- **Oct 15 – Jan 31:** IRS naye saal ke tax brackets / SSA wage base — agent "refresh" alert dega. Claude se `lib/taxYYYY.ts` ka PR banwao, sirf official numbers.
- **Nov–Dec:** Black Friday / holiday credit card / year-end car deals — credit card, percentage, auto loan pages ke pins.
- **Jan–Apr:** tax season — paycheck page.
- **Jul–Sep:** back to school — teachers ko embed widget.

## Title tests (admin "Title tests" card)
Jis page ko impressions bahut milte hain par click kam, uske 3 naye title ideas aate hain. Ek chuno → Claude se PR → **4 hafte** wait → CTR compare. Ek waqt me sirf ek page badlo, warna pata nahi chalega kis cheez ne farak dala.

## Embed widget
Har tool page ke neeche "Embed this calculator" code hai. Teachers/bloggers ko offer karo. Widget ke andar sirf brand naam wala "Powered by HomeMoney Calc" link hai (nofollow) — ye Google ke widget-link rules ke hisaab se safe hai. **Kabhi** widget me keyword wala link mat daalna ("best mortgage calculator") — wo link scheme maana jaata hai.

## Kabhi nahi ❌ (Google penalty / ban)
- Links kharidna ya bechna, "sponsored post with dofollow link"
- Link exchange ("aap mujhe link do, main aapko"), PBN, guest-post farms
- Ek jaise sau pages (sirf city/salary badal ke) ya mass AI articles
- Fake reviews, fake traffic, bots
- Apne affiliate links khud click karna ya dosto/relatives se karwana
- Reddit/Quora pe ek hi link baar-baar chipkana
