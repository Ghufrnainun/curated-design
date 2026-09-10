#!/usr/bin/env python3
"""Generate data.json for design.ghuf.app from the Obsidian vault.
Static site — no framework. Run locally after editing vault, commit data.json, push.
"""
import json, re, sys
from pathlib import Path

VAULT = Path("/home/ubuntu/obsidian-vault")
OUT = Path(__file__).resolve().parent / "src" / "data.js"

URL_RE = re.compile(r"https?://[^\s)\]]+")
# strip common noise after url
def clean(u):
    return u.strip().rstrip('.,;:])"\'`')


class Lines:
    """Iterate note lines, skip YAML frontmatter."""
    def __init__(self, text):
        self.lines = text.splitlines()
        self.i = 0
        if self.lines and self.lines[0].strip() == "---":
            for self.i in range(1, len(self.lines)):
                if self.lines[self.i].strip() == "---":
                    self.i += 1
                    break
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= len(self.lines):
            raise StopIteration
        ln = self.lines[self.i]
        self.i += 1
        return ln


def first_url(text, exclude=()):
    for u in URL_RE.findall(text):
        u = clean(u)
        if u and not any(e in u for e in exclude):
            return u
    return None


def parse_kompilasi():
    """83 component libraries in a markdown table. category = the H2 under which the row falls."""
    p = VAULT / "Ideas/Component Libraries/Kompilasi 80+ Component Library.md"
    entries = []
    cur_cat = "Component Libraries"
    for ln in Lines(p.read_text(errors="ignore")):
        if ln.startswith("## "):
            c = re.sub(r"^##\s+", "", ln)
            # short category label (cut the parenthetical)
            c = re.split(r"\s*[\(\[]", c)[0].strip()
            if c.lower() in ("ringkasan",):
                continue
            cur_cat = c
        m = re.match(r"^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(https?://[^|]+?)\s*\|", ln)
        if m:
            name = m.group(2).strip()
            url = clean(m.group(3))
            entries.append({"name": name, "url": url, "category": cur_cat})
    return entries


def _heading_items(lines, heading_re):
    """Return (heading, url) pairs: for each H2, the first real URL in that section."""
    out = []
    cur = None
    for ln in lines:
        if re.match(heading_re, ln):
            cur = re.sub(heading_re, "", ln).strip()
            cur = re.sub(r"^[0-9#️⃣\-]*", "", cur).strip(" -")
            cur = re.sub(r"\s*[🔗🐙➡️]\s*$", "", cur).strip()
        elif cur and URL_RE.search(ln):
            u = first_url(ln, exclude=("github.com", "x.com", "twitter", "img.shields", "npmjs.com", "notion.site", "threads.com", "cdn."))
            if u:
                out.append({"name": cur, "url": u})
                cur = None
    return out


def _single_frontmatter(p, category):
    t = p.read_text(errors="ignore")
    fm = {}
    m = re.match(r"^---\n(.*?)\n---", t, re.S)
    if m:
        for ln in m.group(1).splitlines():
            if ":" in ln:
                k, v = ln.split(":", 1)
                fm[k.strip()] = v.strip().strip('"').strip("'")
    name = fm.get("name", fm.get("title", p.stem.replace("—", "-")))
    url = fm.get("url") or fm.get("source")
    # clean url (some are parenthesized thread links)
    if url:
        url = url.strip().strip('"').strip("'")
        url = re.sub(r"[)\]]title.*$", "", url)
    return name, url, t


def gather():
    cats = {}

    # --- Component Libraries ---
    cl = []
    cl += parse_kompilasi()

    # structured notes: reuse _heading_items
    for f, head_re in [
        ("4 Tools on the Radar This Week.md", r"^###\s*[0-9#️⃣]*\s*\.?\s*\**"),
        ("5 Motion Resources — Refil Creator.md", r"^##\s+\d\.\s*"),
        ("5 Libraries I Use — Nico Burkart.md", r"^##\s+\d\.\s*"),
    ]:
        p = VAULT / "Ideas/Component Libraries" / f
        if p.exists():
            cl += _heading_items(p.read_text(errors="ignore").splitlines(), head_re)

    # More Open Source Animated Icon Libraries — numbered H2
    p = VAULT / "Ideas/Component Libraries/More Open Source Animated Icon Libraries.md"
    if p.exists():
        cl += _heading_items(p.read_text(errors="ignore").splitlines(), r"^##\s+\d+\.\s*")

    # single-resource notes (name, url, cat)
    singles = [
        ("COBE — 5KB WebGL Interactive Globe.md", "COBE", None),
        ("KumoUI — Cloudflare Design Component Library.md", None, None),
        ("Morphicons — Universal Icon Morphing.md", None, None),
        ("PatternCraft — CSS Background Patterns.md", None, None),
        ("Beautiful UI — AI-Native Primitives.md", None, None),
        ("UI SFX — Semantic Sound Effects for Interfaces.md", "UI SFX", None),
        ("Jakub Antalik — Animated React Components.md", None, None),
        ("MotionVibe Studio — Browser Motion Editor.md", None, None),
        ("Paper Shaders — Zero-Dependency Shaders.md", None, None),
        ("Boneyard — Auto-Generated Skeleton Loading.md", None, None),
    ]
    for fname, fallback, cat in singles:
        p = VAULT / "Ideas/Component Libraries" / fname
        if p.exists():
            name, url, t = _single_frontmatter(p, "Component Libraries")
            if not url:
                url = first_url(t, exclude=("threads.com", "github.com"))
            if name and url:
                cl.append({"name": name, "url": url, "category": cat or "Component Libraries"})
    cats["Component Libraries"] = [x for x in cl if x["url"]]

    # --- Design Inspiration (one entry per note) ---
    di = []
    exclude_names = {"Design Engineer Tools — designengineer.tools"}  # that's the whole reference site itself, skip
    # notes whose Threads URL should map to a real single resource (or expand)
    remap_single = {
        "Kinetics spring motion effects library — Csaba Kissi.md": ("Kinetics", "https://kinetics.colorion.co/"),
        "Shotbase - Website Inspiration Library.md": ("Shotbase", "https://shotbase.com/"),
        "Webinspoo — 1200+ SaaS Design Inspiration.md": ("Webinspoo", "https://webinspoo.com/"),
        "beUI Studio — Gratis Total.md": ("beUI Studio", "https://pro.beui.dev/studio"),
    }
    # notes that are collections of links: expand into entries (no Threads URL)
    collection_expand = {
        "Alternative design and creative tech references — Lalu Aann.md": "Design Inspiration",
        "Design inspiration directories — Tran Mau Tri Tam.md": "Design Inspiration",
        "UI UX inspiration sites — Bablukumar Desk.md": "Design Inspiration",
        "Modern web design tools — Craftwork.md": "Design Inspiration",
        "Best Resources for Creators — Solt Wagner.md": "Design Inspiration",
        "5 Situs Frontend Wajib Bookmark — Novian Nadari.md": "Design Inspiration",
        "Free Open-Source Alternatives — Galih Eka Putra.md": "Design Inspiration",
        "Open-source tools for coders — Csaba Kissi.md": "Design Inspiration",
        "Section-by-Section Website Inspiration — Dzianis Kravchu.md": "Design Inspiration",
        "Webspace for Developers — P Ananthapadmanabhan Nair.md": "Design Inspiration",
    }
    # names that resolve to nothing real (blocked/unextractable posts) -> skip
    skip_names = {"Calvin Saputra Lai — Post Tidak Dapat Diekstrak.md",
                  "Dimas Setiaji — Post Tidak Dapat Diekstrak.md",
                  "dub.sh_deng — Link Tidak Dapat Diakses.md",
                  "monveo.site — Situs Tidak Dapat Diakses.md",
                  "⚠️ Scam — Instagram Prompt Injection Exfiltrasi Env.md"}
    for fname, cat in collection_expand.items():
        p = VAULT / "Ideas/Design Inspiration" / fname
        if not p.exists():
            continue
        t = p.read_text(errors="ignore")
        seen = set()
        for u in URL_RE.findall(t):
            u = clean(u)
            if not u or not u.lower().startswith("http"):
                continue
            if any(s in u for s in ("threads.com", "instagram", "img.shields", "x.com/", "twitter.", "cdn.", "github.com/")):
                continue
            if u in seen:
                continue
            seen.add(u)
            # derive a readable name from the URL host
            host = re.sub(r"^(https?://)?(www\.)?", "", u).split("/")[0]
            di.append({"name": host, "url": u, "category": cat})

    for p in sorted((VAULT / "Ideas/Design Inspiration").glob("*.md")):
        if p.name in collection_expand:
            continue
        if p.name in remap_single:
            name, url = remap_single[p.name]
            di.append({"name": name, "url": url, "category": "Design Inspiration"})
            continue
        if p.name in skip_names:
            continue
        name, url, t = _single_frontmatter(p, "Design Inspiration")
        if not url:
            url = first_url(t)
        if not name or not url:
            continue
        if p.stem in exclude_names:
            continue
        di.append({"name": name, "url": url, "category": "Design Inspiration"})
    cats["Design Inspiration"] = di

    # --- Design Systems (Refero Styles + PatternCraft) ---
    ds = []
    for p in sorted((VAULT / "Design Systems/Refero Styles").glob("*.md")):
        t = p.read_text(errors="ignore")
        # title heading
        name = None
        for ln in t.splitlines():
            if ln.startswith("# "):
                name = ln[2:].strip()
                break
        if not name:
            name = p.stem.replace("-", " ")
        # real site url: first url that's not styles.refero.design and not duplicated
        url = None
        for u in URL_RE.findall(t):
            u = clean(u)
            if u and "styles.refero.design" not in u and not url:
                url = u
        if url:
            ds.append({"name": name, "url": url, "category": "Design Systems"})
    # PatternCraft
    pc = VAULT / "Design Systems/PatternCraft.md"
    if pc.exists():
        t = pc.read_text(errors="ignore")
        url = first_url(t, exclude=("github.com",))
        if url:
            ds.append({"name": "PatternCraft", "url": url, "category": "Design Systems"})
    cats["Design Systems"] = ds

    # --- Developer Tools (static curated list from the note frontmatter) ---
    dev = [
        {"name": "vibeprompts.dev", "url": "https://vibeprompts.dev/", "category": "Developer Tools"},
        {"name": "openmotion.design", "url": "https://openmotion.design/", "category": "Developer Tools"},
        {"name": "Gooey (Jakub Antalik)", "url": "https://gooey.jakubantalik.com/", "category": "Developer Tools"},
        {"name": "Kitbitz", "url": "https://kitbitz.art/", "category": "Developer Tools"},
        {"name": "Renotch", "url": "https://github.com/yosaiy/renotch", "category": "Developer Tools"},
    ]
    cats["Developer Tools"] = dev

    # --- Prompts (source-level links only) ---
    prompts = [
        {"name": "MotionSites AI", "url": "https://motionsites.ai/", "count": 145},
        {"name": "Jiro Build", "url": "https://jiro.build/", "count": 392},
        {"name": "SceneAI", "url": "https://sceneai.art/", "count": 31},
        {"name": "ChatGPT Personas", "url": "https://github.com/f/awesome-chatgpt-prompts", "count": 6},
    ]
    cats["Prompts"] = prompts
    # exclude MotionSites AI prompt-library note from Design Inspiration (it's a prompt source, not a site)
    cats["Design Inspiration"] = [x for x in cats["Design Inspiration"] if "motionsites.ai" not in (x.get("url") or "")]

    return cats


def main():
    cats = gather()
    seen_urls = set()
    for cat, entries in cats.items():
        clean_entries = []
        for x in entries:
            url = x.get("url") or ""
            url = url.strip()
            if not url.lower().startswith("http"):
                continue
            if "Already in Vault" in x.get("name", "") or "already in vault" in x.get("name", "").lower():
                continue
            name = re.sub(r"\*{1,2}", "", x.get("name", "")).strip(" -—")
            # drop trailing annotation junk like " ⭐ PALING PENTING"
            name = re.sub(r"\s*[⭐🌀]+\s*.*$", "", name).strip()
            if not name:
                continue
            if url in seen_urls:
                continue
            seen_urls.add(url)
            x["name"], x["url"] = name, url
            clean_entries.append(x)
        cats[cat] = clean_entries
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = "window.DESIGN_DATA = " + json.dumps(cats, indent=2, ensure_ascii=False) + ";"
    OUT.write_text(payload, encoding="utf-8")
    total = sum(len(v) for v in cats.values())
    print(f"Wrote {OUT}, last line: {bool(payload.strip())}")
    for k, v in cats.items():
        print(f"  {k}: {len(v)}")
    # quick sanity: any missing url
    for k, v in cats.items():
        for x in v:
            if not x.get("url"):
                print("  !missing url", k, x["name"])


if __name__ == "__main__":
    main()
