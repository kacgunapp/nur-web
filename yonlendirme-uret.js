/* ============================================================
   Eski adres (kacgunapp.github.io/nur-web/) → yeni site (kacgunapp.github.io/muslimly-web/) yönlendirmeleri.
   Depo nur-web → muslimly-web olarak yeniden adlandırılınca GitHub Pages eski adresi yönlendirmez; bu paket
   (_nur-web-yonlendirme/) yeni, boş bir "nur-web" deposunun köküne konur. Build 9 ve eski bağlantılar
   (destek/gizlilik, 48 dil sayfası) kırılmaz. "_" ile başlayan klasör GitHub Pages'te (Jekyll) yayımlanmaz.
   Çalıştır: node yonlendirme-uret.js   (deterministik)
   ============================================================ */
const fs = require("fs");
const path = require("path");
const YENI = "https://kacgunapp.github.io/muslimly-web/";
const CIKTI = path.join(__dirname, "_nur-web-yonlendirme");
const KOD = ["tr", "en", "ar", "de", "fr", "id", "ms", "ur", "fa", "ru", "bs", "az", "es", "it", "pt-BR", "pt-PT", "nl", "ca", "ro", "da", "sv", "nb", "fi", "pl", "cs", "sk", "sl", "hr", "hu", "el", "uk", "he", "vi", "th", "ja", "ko", "zh-Hans", "zh-Hant", "hi", "bn", "mr", "gu", "pa", "or", "ta", "te", "kn", "ml"];
const SAYFA = ["index", "destek", "gizlilik"];
/* Yeni sitede şimdilik yalnız Türkçe yayında (çeviri dondurması); dil sayfaları Türkçe karşılığına gider. ÇEVİRİ FAZI'nda
   hedef /<kod>/ olur: ACIK_YENI'ye dili ekleyip yeniden üret. */
const ACIK_YENI = JSON.parse(fs.readFileSync(path.join(__dirname, "dil", "acik.json"), "utf8"));
const hedef = (kod, s) => `${YENI}${kod !== "tr" && ACIK_YENI.includes(kod) ? kod + "/" : ""}${s === "index" ? "" : s + ".html"}`;
const sayfa = (url) => `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Muslimly — taşındı</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${url}">
<script>location.replace(${JSON.stringify(url)} + location.hash);</script>
</head>
<body>
<p>Bu sayfa taşındı: <a href="${url}">${url}</a></p>
</body>
</html>
`;
fs.rmSync(CIKTI, { recursive: true, force: true });
let n = 0;
for (const kod of KOD) for (const s of SAYFA) {
  const dosya = path.join(CIKTI, kod === "tr" ? "" : kod, `${s}.html`);
  fs.mkdirSync(path.dirname(dosya), { recursive: true });
  fs.writeFileSync(dosya, sayfa(hedef(kod, s))); n++;
}
fs.writeFileSync(path.join(CIKTI, "404.html"), sayfa(YENI)); n++;
fs.writeFileSync(path.join(CIKTI, "README.md"), `# nur-web → muslimly-web yönlendirmesi\n\nDepo \`nur-web\` \`muslimly-web\` olarak yeniden adlandırıldıktan sonra bu klasörün içeriği yeni, boş bir \`nur-web\` deposunun köküne konur ve GitHub Pages açılır. ${n} sayfa (48 dil × index/destek/gizlilik + 404) yeni adrese yönlendirir. Üretici: \`node yonlendirme-uret.js\` (muslimly-web deposunda).\n`);
console.log(`→ _nur-web-yonlendirme: ${n} yönlendirme sayfası → ${YENI}`);
