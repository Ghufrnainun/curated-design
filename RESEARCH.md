# RESEARCH.md — curated-design

Research plan, sources, status. Satu file biar gampang nyari.

## Target per kategori

| Kategori | Sekarang | Target | Prioritas |
|---|---|---|---|
| Developer Tools | 5 | ~25 | 🔴 P1 |
| Prompts | 4 | ~20 | 🔴 P1 |
| Design Systems | 20 | ~35 | 🟡 P2 |
| Component Libraries | 110 | ~130 | 🟢 P3 |

## Sumber discovery (prioritas)

| Sumber | Untuk | Rate limit |
|---|---|---|
| GitHub API `/search/repositories` | OSS tools, stars=signal | 60 req/hr (unauthed) |
| `Awesome-*` repos | Curated lists siap pakai | 0 |
| designengineer.tools / competitor sites | Ide kategori yang belum kita cover | 0 |
| Web search | Nyari "best X tools 2026" | tergantung backend |

## Rules

- Semua URL diverifikasi: homepage beneran akses, bukan cuma placeholder
- Dedup against 214 existing (guard di build.mjs udah aktif)
- Format: `- [Nama](URL)` + `## Subkategori` H2
- Per batch 3-5 baru → test → commit. Gak nunggu 100 baru push

## Discovery setup (dijalankan tiap sesi research)

```bash
# GitHub API — cari tool, ambil 5 teratas, simpan ke file
curl -s -o /tmp/gh_Q.json "https://api.github.com/search/repositories?q=KEYWORD&sort=stars&per_page=5&page=1"
# Jangan pipe, selalu file dulu
python3 /tmp/gh_Q.json
```

## Status sesi

| Tanggal | Sesi | Ditambah | Total |
|---|---|---|---|
| 2026-09-11 | Research P1: Dev Tools + Prompts | +22 (Dev Tools 5→20, Prompts 4→11, beberapa scrubbed) | 236 |
