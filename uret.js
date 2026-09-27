/* ============================================================
   Nur tanıtım sitesi — 12 dilli sayfa üreticisi
   Kaynak: dil/<kod>.json (Türkçe esas; çeviriler aynı yapıda).
   Çıktı: Türkçe kökte (index/destek/gizlilik.html — adresler değişmez),
   öbür diller /<kod>/ altında. Her sayfada hreflang alternatifleri,
   dil seçici, lang/dir öznitelikleri. Dış kaynak yok.
   Çalıştır: node uret.js   (deterministik; git diff ile kayma denetimi)
   ============================================================ */
const fs = require("fs");
const path = require("path");
const KOK = __dirname;
const KOD = ["tr", "en", "ar", "de", "fr", "id", "ms", "ur", "fa", "ru", "bs", "az"];
const RTL = ["ar", "ur", "fa"];
const SITE = "https://kacgunapp.github.io/nur-web/";      // GitHub Pages kökü
const EPOSTA = "dogac@teknikaotomasyon.com";

const kacis = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ham = (s) => String(s);           // <strong> gibi izinli işaretleme taşıyan alanlar
const oku = (k) => { const p = path.join(KOK, "dil", `${k}.json`); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; };
/* Yayındaki diller: dil/acik.json (uygulamanın dil kapısıyla aynı — anadil kontrolü yapılmamış çeviri yayımlanmaz).
   Kapalı dillerin dil/<kod>.json kaynağı durur; sayfası üretilmez, eski sayfası silinir. */
const ACIK = JSON.parse(fs.readFileSync(path.join(KOK, "dil", "acik.json"), "utf8"));
if (!ACIK.includes("tr")) throw new Error("dil/acik.json: Türkçe her zaman açık");
const diller = KOD.filter((k) => ACIK.includes(k)).map(oku).filter(Boolean);
for (const k of KOD) if (k !== "tr" && !ACIK.includes(k) && fs.existsSync(path.join(KOK, k))) fs.rmSync(path.join(KOK, k), { recursive: true });
const trD = diller.find((d) => d.kod === "tr");
if (!trD) throw new Error("dil/tr.json yok");

/* Çeviri dosyası Türkçe yapıyla aynı anahtar ağacına sahip olmalı (dizi uzunlukları dâhil) */
function yapiKontrol(a, b, yol, kod) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) throw new Error(`${kod}: ${yol} dizi uzunluğu Türkçeden farklı`);
    a.forEach((x, i) => yapiKontrol(x, b[i], `${yol}[${i}]`, kod));
  } else if (a && typeof a === "object") {
    for (const k of Object.keys(a)) { if (!(k in b)) throw new Error(`${kod}: ${yol}.${k} eksik`); yapiKontrol(a[k], b[k], `${yol}.${k}`, kod); }
    for (const k of Object.keys(b)) if (!(k in a)) throw new Error(`${kod}: ${yol}.${k} Türkçede yok`);
  } else if (typeof a === "string" && typeof b !== "string") throw new Error(`${kod}: ${yol} metin değil`);
}
for (const d of KOD.map(oku).filter(Boolean)) if (d.kod !== "tr") yapiKontrol(trD, d, "", d.kod);   // kapalı dillerin kaynağı da tutarlı kalsın

const on = (kod) => (kod === "tr" ? "" : "../");                     // kökten göreli varlık yolu
const sayfaUrl = (kod, sayfa) => `${SITE}${kod === "tr" ? "" : kod + "/"}${sayfa === "index" ? "" : sayfa + ".html"}`;

function bas(d, sayfa, baslik, aciklama) {
  const alternatif = diller.map((x) => `<link rel="alternate" hreflang="${x.kod}" href="${sayfaUrl(x.kod, sayfa)}">`).join("\n");
  return `<!doctype html>
<html lang="${d.kod}" dir="${RTL.includes(d.kod) ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacis(baslik)}</title>
<meta name="description" content="${kacis(aciklama)}">
<meta name="theme-color" content="#2A1750">
<link rel="canonical" href="${sayfaUrl(d.kod, sayfa)}">
${alternatif}
<link rel="alternate" hreflang="x-default" href="${sayfaUrl("tr", sayfa)}">
<link rel="icon" href="${on(d.kod)}favicon.png" type="image/png">
<link rel="apple-touch-icon" href="${on(d.kod)}apple-touch-icon.png">
<link rel="stylesheet" href="${on(d.kod)}style.css">
</head>
<body>
<header class="ust">
  <div class="ic">
    <a class="marka" href="./"><img src="${on(d.kod)}favicon.png" alt="" width="36" height="36">Nur</a>
    <nav aria-label="Site">
      <a href="./"${sayfa === "index" ? ' aria-current="page"' : ""}>${kacis(d.nav.tanitim)}</a>
      <a href="destek.html"${sayfa === "destek" ? ' aria-current="page"' : ""}>${kacis(d.nav.destek)}</a>
      <a href="gizlilik.html"${sayfa === "gizlilik" ? ' aria-current="page"' : ""}>${kacis(d.nav.gizlilik)}</a>
    </nav>
  </div>
</header>
`;
}

function dilSecici(d, sayfa) {
  if (diller.length < 2) return "";                    // tek açık dil: seçici gösterilmez
  const dosya = sayfa === "index" ? "" : `${sayfa}.html`;
  return `  <nav class="diller" aria-label="${kacis(d.nav.dil)}">
    ${diller.map((x) => x.kod === d.kod
      ? `<span aria-current="true" lang="${x.kod}">${kacis(x.ad)}</span>`
      : `<a href="${d.kod === "tr" ? "" : "../"}${x.kod === "tr" ? "" : x.kod + "/"}${dosya || "./"}" lang="${x.kod}" hreflang="${x.kod}">${kacis(x.ad)}</a>`).join("\n    ")}
  </nav>
`;
}

function son(d, sayfa) {
  const baglar = [["index", d.nav.tanitim], ["destek", d.nav.destek], ["gizlilik", d.nav.gizlilik]].filter(([s]) => s !== sayfa)
    .map(([s, ad]) => `    <a href="${s === "index" ? "./" : s + ".html"}">${kacis(ad)}</a>`).join("\n");
  const not = d.ceviriNotu ? `  <p class="ceviri-notu ic">${kacis(d.ceviriNotu)}</p>\n` : "";
  return `${not}<footer>
  <div class="ic">
    <span>${kacis(d.telif)}</span>
${baglar}
  </div>
</footer>
</body>
</html>
`;
}

function index(d) {
  const k = d.kahraman;
  return bas(d, "index", d.baslik, d.metaAciklama) + `
<main class="ic">
${dilSecici(d, "index")}  <section class="kahraman">
    <img src="${on(d.kod)}icon.png" alt="${kacis(k.simgeAlt)}" width="116" height="116">
    <h1>${kacis(d.baslik)}</h1>
    <p class="giris">${kacis(k.giris)}</p>
    <span class="rozet">${kacis(k.rozet)}</span>
  </section>

  <h2>${kacis(d.nelerVar)}</h2>
  <div class="izgara">
${d.kartlar.map((x) => `    <article class="kart">
      <div class="ikon" aria-hidden="true">${x.ikon}</div>
      <h3>${kacis(x.h3)}</h3>
      <p>${kacis(x.p)}</p>
    </article>`).join("\n")}
  </div>

  <section class="gizlilik" aria-labelledby="gizlilik-baslik">
    <h2 id="gizlilik-baslik">${kacis(d.gizlilikOzet.h2)}</h2>
    <ul>
${d.gizlilikOzet.maddeler.map((m) => `      <li>${kacis(m)}</li>`).join("\n")}
    </ul>
    <p><a href="gizlilik.html">${kacis(d.gizlilikOzet.tamMetin)}</a></p>
  </section>
</main>

` + son(d, "index");
}

function destek(d) {
  const s = d.destek;
  const posta = `mailto:${EPOSTA}?subject=${encodeURIComponent(s.iletisimKonu)}`;
  return bas(d, "destek", s.metaBaslik, s.metaAciklama) + `
<main class="ic">
${dilSecici(d, "destek")}  <h1>${kacis(s.h1)}</h1>
  <p>${kacis(s.giris)}</p>
  <h2>${kacis(s.sssBaslik)}</h2>
${s.sss.map((q) => `  <details>
    <summary>${kacis(q.soru)}</summary>
${q.giris ? `    <p>${kacis(q.giris)}</p>\n` : ""}    <ol>
${q.adimlar.map((a) => `      <li>${ham(a)}</li>`).join("\n")}
    </ol>
${q.son ? `    <p>${kacis(q.son)}</p>\n` : ""}  </details>`).join("\n")}
  <section class="iletisim" aria-labelledby="iletisim-baslik">
    <h2 id="iletisim-baslik" style="margin-top:0">${kacis(s.iletisimBaslik)}</h2>
    <p>${kacis(s.iletisim)} <a href="${posta}">${EPOSTA}</a></p>
    <p style="margin-bottom:0">${kacis(s.iletisimNot)}</p>
  </section>
</main>
` + son(d, "destek");
}

function gizlilik(d) {
  const g = d.gizlilik;
  const posta = `mailto:${EPOSTA}?subject=${encodeURIComponent(g.iletisimKonu)}`;
  return bas(d, "gizlilik", g.metaBaslik, g.metaAciklama) + `
<main class="ic belge">
${dilSecici(d, "gizlilik")}  <h1>${kacis(g.h1)}</h1>
  <p class="tarih">${kacis(g.tarih)}</p>
  <p>${kacis(g.giris)}</p>
${g.bolumler.map((b) => `  <h2>${kacis(b.h2)}</h2>\n${b.p.map((p) => `  <p>${kacis(p)}</p>`).join("\n")}`).join("\n")}
  <h2>${kacis(g.iletisimBaslik)}</h2>
  <p>${kacis(g.iletisim)} <a href="${posta}">${EPOSTA}</a></p>
</main>
` + son(d, "gizlilik");
}

let sayi = 0;
for (const d of diller) {
  const dizin = d.kod === "tr" ? KOK : path.join(KOK, d.kod);
  fs.mkdirSync(dizin, { recursive: true });
  fs.writeFileSync(path.join(dizin, "index.html"), index(d));
  fs.writeFileSync(path.join(dizin, "destek.html"), destek(d));
  fs.writeFileSync(path.join(dizin, "gizlilik.html"), gizlilik(d));
  sayi += 3;
}
/* sitemap: bütün diller */
fs.writeFileSync(path.join(KOK, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${diller.flatMap((d) => ["index", "destek", "gizlilik"].map((s) => `  <url><loc>${sayfaUrl(d.kod, s)}</loc></url>`)).join("\n")}\n</urlset>\n`);
console.log(`→ ${diller.length} dil × 3 sayfa = ${sayi} sayfa, sitemap.xml`);
