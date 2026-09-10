// parse.mjs — parse resources/*.md into structured data.
// Format per file:
//   # Category Title
//   (blank)
//   ## Optional Subcategory
//   - [Name](https://url)
//   - [Name](https://url) (optional note)

import fs from "node:fs";
import path from "node:path";

const BULLET = /^\s*-\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+(.*))?$/;

/**
 * Parse a single markdown file's text.
 * @param {string} text
 * @returns {{title:string, groups:{name:string, items:{name:string,url:string,note?:string}[]}[]}}
 */
export function parseMarkdown(text) {
  const lines = text.split(/\r?\n/);
  let title = "";
  let currentGroup = null;
  const groups = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("## ")) {
      const name = line.slice(3).trim();
      currentGroup = { name, items: [] };
      groups.push(currentGroup);
      continue;
    }
    const m = BULLET.exec(line);
    if (m) {
      const name = m[1].trim();
      const url = m[2].trim();
      const note = m[3] ? m[3].trim() : undefined;
      if (!currentGroup) {
        currentGroup = { name: "General", items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push({ name, url, ...(note ? { note } : {}) });
    }
    // ignore blank lines and other markdown
  }

  return { title, groups };
}

/**
 * Parse all resource files in a directory.
 * @param {string} dirPath
 * @returns {Object<string, {title:string, groups:Array}>}
 */
export function parseDirectory(dirPath) {
  const out = {};
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md")).sort();
  for (const f of files) {
    const text = fs.readFileSync(path.join(dirPath, f), "utf8");
    out[f] = parseMarkdown(text);
  }
  return out;
}