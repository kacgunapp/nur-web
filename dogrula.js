/* dil/<kod>.json yapı denetimi: Türkçe kaynakla aynı anahtar ağacı ve dizi uzunlukları,
   boş metin yok, yön/kod alanları doğru. Kullanım: node dogrula.js <kod> */
const fs = require("fs");
const kod = process.argv[2];
if (!kod) { console.error("kullanım: node dogrula.js <kod>"); process.exit(2); }
const tr = JSON.parse(fs.readFileSync(`dil/tr.json`, "utf8"));
const d = JSON.parse(fs.readFileSync(`dil/${kod}.json`, "utf8"));
const RTL = ["ar", "ur", "fa", "he"];
const hata = [];
function kontrol(a, b, yol) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return hata.push(`${yol}: dizi uzunluğu ${b && b.length} ≠ ${a.length}`);
    a.forEach((x, i) => kontrol(x, b[i], `${yol}[${i}]`));
  } else if (a && typeof a === "object") {
    for (const k of Object.keys(a)) { if (!(k in b)) { hata.push(`${yol}.${k} eksik`); continue; } kontrol(a[k], b[k], `${yol}.${k}`); }
    for (const k of Object.keys(b)) if (!(k in a)) hata.push(`${yol}.${k} Türkçede yok`);
  } else if (typeof a === "string") {
    if (typeof b !== "string") hata.push(`${yol}: metin değil`);
    else if (!b.trim() && a.trim() && yol !== ".ceviriNotu") hata.push(`${yol}: boş`);
  }
}
kontrol(tr, d, "");
if (d.kod !== kod) hata.push(`kod alanı "${d.kod}" ≠ ${kod}`);
if (d.yon !== (RTL.includes(kod) ? "rtl" : "ltr")) hata.push(`yon alanı ${d.yon} olmamalı`);
if (kod !== "tr" && !d.ceviriNotu) hata.push("ceviriNotu boş olmamalı (Türkçe metin esastır notu)");
const ayni = JSON.stringify(d.kartlar) === JSON.stringify(tr.kartlar) || d.gizlilik.giris === tr.gizlilik.giris;
if (kod !== "tr" && ayni) hata.push("çeviri Türkçenin kopyası");
if (hata.length) { console.log(hata.map((h) => "  ✗ " + h).join("\n")); process.exit(1); }
console.log(`  ✓ dil/${kod}.json yapısı Türkçe kaynakla aynı`);
