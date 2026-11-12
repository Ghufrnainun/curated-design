// fetch-og.mjs — collect a verified Open Graph preview image URL per resource into resources/og.json.
// Cached: skips URLs that already have a non-null value. Flags: --retry-failed, --refresh.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { parseDirectory } from "./parse.mjs";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const RES_DIR = path.join(ROOT, "resources");
const OUT_FILE = path.join(RES_DIR, "og.json");
const CATEGORY_FILES = [
  "component-libraries.md", "design-systems.md",
  "design-inspiration.md", "developer-tools.md", "prompts.md",
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9" };
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 400 * 1024;
const CONCURRENCY = 8;
const KEYS = ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"];

const args = new Set(process.argv.slice(2));
const REFRESH = args.has("--refresh");
const RETRY_FAILED = args.has("--retry-failed");

function resourceUrls() {
  const parsed = parseDirectory(RES_DIR);
  const seen = new Set();
  for (const f of CATEGORY_FILES) {
    const p = parsed[f];
    if (!p) continue;
    for (const g of p.groups) for (const it of g.items) seen.add(it.url);
  }
  return [...seen];
}

async function timed(fn) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try { return await fn(ac.signal); } finally { clearTimeout(t); }
}

async function fetchHead(pageUrl) {
  return timed(async (signal) => {
    const res = await fetch(pageUrl, { headers: HEADERS, redirect: "follow", signal });
    if (!res.ok || !res.body) { res.body?.cancel().catch(() => {}); throw new Error(`HTTP ${res.status}`); }
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    reader.cancel().catch(() => {});
    return { html: Buffer.concat(chunks).toString("utf8"), finalUrl: res.url || pageUrl };
  });
}

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&#47;/g, "/").replace(/&quot;/g, '"').trim();
}

function extractImage(html) {
  const found = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    // quoted (single/double) or unquoted attribute values (minified HTML)
    const attr = (n) => tag.match(new RegExp(`\\b${n}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
    const k = attr("property") || attr("name");
    const c = attr("content");
    if (!k || !c) continue;
    const key = (k[1] ?? k[2] ?? k[3]).trim().toLowerCase();
    const val = c[1] ?? c[2] ?? c[3].replace(/\/$/, ""); // unquoted: drop self-closing slash
    if (KEYS.includes(key) && !(key in found) && val.trim()) found[key] = decode(val);
  }
  for (const k of KEYS) if (found[k]) return found[k];
  return null;
}

async function verifyImage(imgUrl) {
  const ok = (r) => r.status === 200 && (r.headers.get("content-type") || "").toLowerCase().startsWith("image/");
  try {
    const r = await timed((signal) => fetch(imgUrl, { method: "HEAD", headers: { "User-Agent": UA }, redirect: "follow", signal }));
    if (ok(r)) return true;
  } catch {}
  try {
    return await timed(async (signal) => {
      const r = await fetch(imgUrl, { headers: { "User-Agent": UA }, redirect: "follow", signal });
      r.body?.cancel().catch(() => {});
      return ok(r);
    });
  } catch { return false; }
}

async function probe(pageUrl) {
  let page;
  try { page = await fetchHead(pageUrl); } catch { return { img: null, reason: "fetch" }; }
  const raw = extractImage(page.html);
  if (!raw) return { img: null, reason: "meta" };
  let img;
  try { img = new URL(raw, page.finalUrl).href; } catch { return { img: null, reason: "meta" }; }
  if (!/^https?:/.test(img)) return { img: null, reason: "meta" };
  return (await verifyImage(img)) ? { img, reason: null } : { img: null, reason: "verify" };
}

const urls = resourceUrls();
const urlSet = new Set(urls);
let prev = {};
try { prev = JSON.parse(fs.readFileSync(OUT_FILE, "utf8")); } catch {}

const out = {};
for (const [k, v] of Object.entries(prev)) if (urlSet.has(k)) out[k] = v;
const todo = urls.filter((u) => REFRESH || !(u in out) || (out[u] === null && RETRY_FAILED));
console.log(`Resources: ${urls.length}, cached: ${urls.length - todo.length}, to fetch: ${todo.length}`);

const reasons = { fetch: [], meta: [], verify: [] };
let done = 0, idx = 0;
async function worker() {
  while (idx < todo.length) {
    const u = todo[idx++];
    const { img, reason } = await probe(u);
    out[u] = img;
    if (reason) reasons[reason].push(u);
    if (++done % 50 === 0) console.log(`  progress: ${done}/${todo.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const sorted = Object.fromEntries(urls.map((u) => [u, out[u] ?? null]).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + "\n");

const found = Object.values(sorted).filter(Boolean).length;
console.log(`Done. total=${urls.length} found=${found} missing=${urls.length - found}`);
console.log(`Missing this run: fetch failed=${reasons.fetch.length} no meta tag=${reasons.meta.length} image failed verification=${reasons.verify.length}`);
const unprobed = urls.length - found - reasons.fetch.length - reasons.meta.length - reasons.verify.length;
if (unprobed > 0) console.log(`  (${unprobed} null entries carried from cache, not re-tried; use --retry-failed)`);
for (const [r, list] of Object.entries(reasons)) for (const u of list) console.log(`  [${r}] ${u}`);
