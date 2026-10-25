# HomeMoney Calc — Security plan (hack, bots, DDoS, ranking giraana)

**Seedhi baat pehle:** hamari site **static** hai. Server pe koi code nahi chalta, koi database, login ya form nahi hai jo data bheje. WordPress jaisi sites isi wajah se hack hoti hain (plugin, login page, database). Humare paas ye darwaze hain hi nahi.

Isliye hack ka asli raasta sirf **aapke accounts** hain: Gmail, GitHub, Cloudflare, Namecheap. Agar koi inme ghus gaya, to wo site badal sakta hai. Inki hifazat sabse zaroori hai.

Admin panel ka **🔒 Security** card yahi checklist dikhata hai (`data/security-checklist.json`).

---

## 1. Hack se bachaav

| Khatra | Kya kiya / kya karna hai | User pe asar |
|---|---|---|
| Account chori (password leak) | Sab accounts pe **2FA** (authenticator app). Recovery codes ghar pe. **Aapka kaam.** | Koi nahi |
| GitHub se galat change deploy hona | Repo private; owner-approved local work mein tests/build ke baad direct `main` push. Commit history aur Cloudflare rollback available. Unattended Claude workflows apne configured PR flow mein rehte hain | Local work mein manual merge step nahi |
| Domain chori ya expire | Namecheap **Domain Lock + auto-renew**. Renewal date yaad rakho (1 saal) | Koi nahi |
| Page me script ghusana (XSS) | ✅ CSP header: sirf apni site ki script chalti hai. ✅ URL se aaye inputs sirf allowed values, max 200 akshar. ✅ Schema me "<" escape. React har text escape karta hai | Koi nahi |
| Dusri site hamara page iframe me daal ke dhokha de (clickjacking) | ✅ `X-Frame-Options` + `frame-ancestors 'self'`. Sirf `/embed/` frame ho sakta hai, usme koi login/payment nahi | Koi nahi |
| Affiliate link badal ke kahin aur bhejna | ✅ `/go/` links sirf `data/offers.json` se. Galat/ajeeb URL pe build ruk jaata hai | Koi nahi |
| Admin data leak | ✅ Public site me admin banta hi nahi. Alag project + Cloudflare Access (sirf aapka email, OTP) | Koi nahi |
| Kharab npm package | ✅ Live site me jaane wale packages: 0 known vulnerabilities (25 Oct). Dependabot alerts ON karenge | Koi nahi |
| GitHub Action se code chalana (prompt injection) | ✅ `@claude` workflow sirf owner ke issue/comment pe chalta hai. Workflow outputs env se pass hote hain | Koi nahi |
| Fake email aapke domain se | SPF + DMARC DNS records | Koi nahi |

## 2. Bots aur DDoS

**DDoS se site band ho sakti hai?** Bahut mushkil hai.
- Cloudflare Pages static files ko duniya bhar ke CDN se serve karta hai. DDoS protection **free plan me bhi unlimited aur hamesha ON** hai.
- Static pages ke requests ka koi bill nahi aata. Isliye attack hamara paisa bhi nahi kha sakta.
- ✅ Build files pe 1 saal ka cache laga hai, to zyada traffic CDN hi sambhal leta hai.

**Cloudflare settings (account milne pe main lagaunga):**
1. **Bot Fight Mode ON.** Bekaar bots ko chupchaap rokta hai. Googlebot/Bingbot jaise "verified" bots allowed rehte hain, isliye ranking pe asar nahi.
2. **Rate limit (free plan me 1 rule) — sirf `/go/*` pe.** Ek IP 10 second me 10 se zyada affiliate clicks kare to 10 second block.
   - Kyun sabse zaroori: bot ke fake clicks se affiliate network account ko risk ho sakta hai. Insaan itni jaldi click karta hi nahi, to UX pe asar nahi.
3. **WAF custom rule:** `/wp-admin`, `/wp-login.php`, `/xmlrpc.php`, `/.env`, `/.git` pe Block. Ye hacker ke scanners hain; hamari site pe ye files hain hi nahi.
4. **Always Use HTTPS, Minimum TLS 1.2, DNSSEC ON.**
5. **"Under Attack Mode" OFF rakhna.** Ye har visitor ko 5 second ka challenge dikhata hai, jo UX kharab karta hai. Sirf emergency me (neeche dekho).
6. **CAPTCHA kahin nahi.** Hamare paas form/login hai hi nahi, isliye zaroorat nahi.

**AI bots:** Cloudflare me "Block AI bots" ka option hai. Abhi **band rakhenge**, kyunki ChatGPT/Perplexity search se bhi visitors aate hain. Baad me data dekh ke faisla karenge.

## 3. Koi ranking giraane ki koshish kare (negative SEO)

| Unka tareeka | Asar | Hamara jawab |
|---|---|---|
| Bots se fake traffic bhejna | **Google ranking pe asar nahi.** Google apni ranking ke liye hamara traffic data use nahi karta | Bot Fight Mode. GA4 lagaya to bot filter. Fake numbers pe faisle mat lena |
| Affiliate links pe fake clicks | **Asli khatra** — network account band kar sakta hai | `/go/` rate limit + robots.txt + nofollow/sponsored (✅). Network ko khud report karo agar ajeeb clicks dikhen |
| Hazaron spam backlinks | Google aise links zyaatar khud ignore karta hai | Search Console → Manual actions har hafte. Sirf manual action aaye tab disavow file |
| Hamara content copy karna | Canonical tag hamari asli URL batata hai (✅) | Search Console me hum original. Zaroorat ho to Google ko DMCA request |
| `?ajeeb=text` wali URLs link karna | Canonical saaf URL pe point karta hai (✅). Sirf allowed inputs dikhte hain | Kuch nahi karna |
| `homemoneycalc.pages.dev` copy index karwana | ✅ pages.dev par `noindex` header laga diya | Kuch nahi karna |
| Domain ke naam se fake email | Reputation kharab | SPF + DMARC |

## 4. User experience — kya **nahi** badla
Visitor ko koi CAPTCHA, challenge page, pop-up ya extra wait nahi dikhta. Saare headers browser ke andar chupchaap kaam karte hain. Pages utne hi fast hain, aur repeat visit pe cache ki wajah se aur fast.

## 5. Emergency — kuch gadbad dikhe to
1. **Site pe ajeeb content dikhe:** GitHub → last commits dekho → mujhe batao (purana version 1 click me wapas: Cloudflare Pages → Deployments → "Rollback").
2. **Bahut bada attack (site slow):** Cloudflare → Security → **Under Attack Mode ON**, 1–2 ghante, phir OFF.
3. **Account hack ka shak:** turant password badlo → "sign out all sessions" → 2FA dobara → GitHub/Cloudflare ke API tokens aur secrets badlo → mujhe batao.
4. **Affiliate network ne invalid clicks ki warning di:** `/go/` rate limit check karo, Cloudflare Analytics → Security events me IPs dekho, network ko saaf jawab do.

## 6. Kabhi mat karna
- Password, 2FA code, recovery code ya API key **chat me kisi ko bhi** (mujhe bhi) mat bhejna. Keys sirf GitHub secrets me.
- "Site ki ranking badhane" wale bot/traffic services kabhi mat lena. Yahi invalid traffic hota hai.
- Anjaan browser extension ya "SEO tool" ko Google/GitHub account ka access mat dena.
