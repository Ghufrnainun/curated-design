// fetch-favs.mjs — download favicons for all resource domains into public/favs/.
// Cached: skips domains that already have a file. Run before build.mjs.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import https from "node:https";
import http from "node:http";
import { parseDirectory } from "./parse.mjs";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const RES_DIR = path.join(ROOT, "resources");
const OUT_DIR = path.join(ROOT, "public", "favs");
const CATEGORY_FILES = [
  "component-libraries.md", "design-systems.md",
  "design-inspiration.md", "developer-tools.md", "prompts.md",
];

function uniqueDomains() {
  const parsed = parseDirectory(RES_DIR);
  const seen = new Set();
  for (const f of CATEGORY_FILES) {
    const p = parsed[f];
    if (!p) continue;
    for (const g of p.groups) {
      for (const it of g.items) {
        let host;
        try { host = new URL(it.url).hostname.replace(/^www\./, ""); }
        catch { continue; }
        if (!seen.has(host)) seen.add(host);
      }
    }
  }
  return [...seen].sort();
}

function download(urlStr, dest) {
  return new Promise((resolve) => {
    const mod = urlStr.startsWith("https") ? https : http;
    const req = mod.get(urlStr, { headers: { "User-Agent": "Mozilla/5.0 (curated-design favicon fetcher)" }, timeout: 8000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        resolve(download(new URL(res.headers.location, urlStr).href, dest));
        return;
      }
      if (res.statusCode !== 200) { res.resume(); resolve(false); return; }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 50) { resolve(false); return; }
        fs.writeFileSync(dest, buf);
        resolve(true);
      });
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const domains = uniqueDomains();
const missing = domains.filter((d) => !fs.existsSync(path.join(OUT_DIR, `${d}.png`)));
console.log(`Domains: ${domains.length}, already cached: ${domains.length - missing.length}, to fetch: ${missing.length}`);

let ok = 0, fail = 0;
for (const d of missing) {
  const dest = path.join(OUT_DIR, `${d}.png`);
  const success = await download(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64`, dest);
  if (success) { ok++; } else { fail++; try { fs.unlinkSync(dest); } catch {} }
  if ((ok + fail) % 50 === 0) console.log(`  progress: ${ok + fail}/${missing.length} (ok=${ok} fail=${fail})`);
}
console.log(`Done. ok=${ok} fail=${fail}`);