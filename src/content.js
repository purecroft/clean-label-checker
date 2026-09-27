/*
 * Clean Label Checker - content script.
 * Scans visible page text locally and highlights common fillers, excipients and additives.
 * No network requests. No data leaves the page.
 * Copyright (c) 2026 Pure Croft SASU - MIT License
 */
(function () {
  "use strict";
  if (globalThis.__clcLoaded) return;
  globalThis.__clcLoaded = true;

  const api = globalThis.browser || globalThis.chrome;
  const DATA = globalThis.CLC_DATA;
  if (!api || !DATA) return;

  const MARK_CLASS = "clc-mark";
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE", "SVG", "CANVAS", "IFRAME", "TEMPLATE", "MARK"]);
  const MAX_TEXT_NODES = 25000;
  const HOST = location.hostname;

  let settings = { enabled: true, allowlist: [], mode: "ingredients" };
  let observer = null;
  let rescanTimer = null;
  let applying = false;

  // ---------- dictionary / regex building ----------
  const stripAccents = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const termToId = new Map();
  const eToId = new Map();
  const byId = new Map();
  for (const ing of DATA.INGREDIENTS) {
    byId.set(ing.id, ing);
    for (const t of ing.terms) {
      for (const v of new Set([t.toLowerCase(), stripAccents(t.toLowerCase())])) {
        if (!termToId.has(v)) termToId.set(v, ing.id);
      }
    }
    for (const e of ing.e || []) eToId.set(e.toUpperCase(), ing.id);
  }
  const allTerms = [...termToId.keys()].sort((a, b) => b.length - a.length);
  const termPattern = allTerms
    .map((t) => escapeRe(t).replace(/(\\-|\s)+/g, "[\\s\\u00a0\\-]+").replace(/'/g, "['\u2019]"))
    .join("|");
  // Word-boundary-safe (Unicode) term regex, case-insensitive
  const TERM_RE = new RegExp("(?<![\\p{L}\\p{N}])(?:" + termPattern + ")(?![\\p{L}\\p{N}])", "giu");
  // E-numbers: case-sensitive capital E, e.g. E171, E 171, E-171, E150d, E460(i)
  const E_RE = /(?<![\p{L}\p{N}])E[\s\u00a0\-]?(\d{3,4})([a-d])?(?:\s?\((i{1,3}|iv|v)\))?(?![\p{L}\p{N}])/gu;
  const KEYWORD_RE = new RegExp("(?<![\\p{L}])(?:" + DATA.KEYWORDS.map(escapeRe).join("|") + ")(?![\\p{L}])", "iu");

  const normKey = (s) => stripAccents(s.toLowerCase()).replace(/[\s\u00a0\-]+/g, " ").replace(/\u2019/g, "'").trim();
  const normToId = new Map();
  for (const [k, v] of termToId) if (!normToId.has(normKey(k))) normToId.set(normKey(k), v);
  function lookupTerm(matchText) {
    return normToId.get(normKey(matchText)) || null;
  }
  function lookupE(num, letter, roman) {
    const keys = [];
    if (letter) keys.push("E" + num + letter.toLowerCase());
    if (roman) keys.push("E" + num + roman.toLowerCase());
    keys.push("E" + num);
    for (const k of keys) {
      const id = eToId.get(k.toUpperCase());
      if (id) return { id, code: k };
    }
    const n = parseInt(num, 10);
    const range = DATA.E_RANGES.find((r) => n >= r.from && n <= r.to);
    if (!range) return null;
    const code = "E" + num + (letter ? letter.toLowerCase() : "");
    return { id: "E:" + code, code, range };
  }

  // ---------- visibility / text node collection ----------
  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    const st = getComputedStyle(el);
    return st.display !== "none" && st.visibility !== "hidden" && el.getClientRects().length > 0;
  }
  function acceptable(node) {
    let el = node.parentElement;
    if (!el) return false;
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      if (SKIP_TAGS.has(p.tagName) || p.isContentEditable || p.classList.contains(MARK_CLASS)) return false;
    }
    return isVisible(el);
  }
  function collectTextNodes(root, out) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || n.nodeValue.trim().length < 2) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode()) && out.length < MAX_TEXT_NODES) {
      if (acceptable(n)) out.push(n);
    }
    return out;
  }

  // Find ingredient-list containers: blocks near "Ingredients", "Ingrédients", "Composition", etc.
  function findIngredientRoots() {
    const roots = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n, guard = 0;
    while ((n = walker.nextNode()) && guard++ < MAX_TEXT_NODES) {
      if (!n.nodeValue || !KEYWORD_RE.test(n.nodeValue)) continue;
      const el = n.parentElement;
      if (!el || SKIP_TAGS.has(el.tagName) || !isVisible(el)) continue;
      let block = el.closest("p,li,td,th,dd,dt,div,section,article,h1,h2,h3,h4,h5,h6,span,strong,b,label,summary,details") || el;
      // Short heading/label: widen to parent, or use following siblings if parent is huge
      let hops = 0;
      while (block && (block.textContent || "").trim().length < 60 && hops < 3) {
        const parent = block.parentElement;
        if (!parent || parent === document.body) break;
        if ((parent.textContent || "").length > 6000) {
          let sib = block.nextElementSibling, k = 0;
          while (sib && k++ < 3) { roots.add(sib); sib = sib.nextElementSibling; }
          break;
        }
        block = parent; hops++;
      }
      if (block && (block.textContent || "").length <= 20000) roots.add(block);
    }
    // de-duplicate nested roots
    const list = [...roots];
    return list.filter((r) => !list.some((o) => o !== r && o.contains(r)));
  }

  // ---------- highlighting ----------
  function findMatches(text) {
    const res = [];
    TERM_RE.lastIndex = 0;
    let m;
    while ((m = TERM_RE.exec(text))) {
      const id = lookupTerm(m[0]);
      if (id) res.push({ start: m.index, end: m.index + m[0].length, id, text: m[0] });
    }
    E_RE.lastIndex = 0;
    while ((m = E_RE.exec(text))) {
      const r = lookupE(m[1], m[2], m[3]);
      if (r) res.push({ start: m.index, end: m.index + m[0].length, id: r.id, code: r.code, range: r.range, text: m[0] });
    }
    res.sort((a, b) => a.start - b.start || b.end - a.end);
    const out = [];
    let last = -1;
    for (const r of res) if (r.start >= last) { out.push(r); last = r.end; }
    return out;
  }

  function labelFor(id, lang) {
    if (id.startsWith("E:")) return id.slice(2);
    const ing = byId.get(id);
    return ing ? ing.name[lang] || ing.name.en : id;
  }
  function infoFor(id, lang, range) {
    if (id.startsWith("E:")) {
      const code = id.slice(2);
      const num = parseInt(code.slice(1), 10);
      const rg = range || DATA.E_RANGES.find((x) => num >= x.from && num <= x.to);
      return lang === "fr"
        ? `Code européen d'un additif alimentaire autorisé (famille : ${rg ? rg.fr : "additif"}).`
        : `EU code for an authorised food additive (group: ${rg ? rg.en : "additive"}).`;
    }
    const ing = byId.get(id);
    return ing ? ing.info[lang] || ing.info.en : "";
  }
  const LANG = (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";

  function highlightNode(node) {
    const text = node.nodeValue;
    const matches = findMatches(text);
    if (!matches.length) return 0;
    const frag = document.createDocumentFragment();
    let pos = 0;
    for (const m of matches) {
      if (m.start > pos) frag.appendChild(document.createTextNode(text.slice(pos, m.start)));
      const mark = document.createElement("mark");
      const ing = byId.get(m.id);
      const cat = ing ? ing.cat : "enumber";
      mark.className = `${MARK_CLASS} clc-cat-${cat}`;
      mark.dataset.clc = m.id;
      mark.title = `${labelFor(m.id, LANG)} - ${infoFor(m.id, LANG, m.range)}`;
      mark.textContent = text.slice(m.start, m.end);
      frag.appendChild(mark);
      pos = m.end;
    }
    if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
    return matches.length;
  }

  function clearHighlights() {
    const parents = new Set();
    document.querySelectorAll("mark." + MARK_CLASS).forEach((m) => {
      const p = m.parentNode;
      if (!p) return;
      p.replaceChild(document.createTextNode(m.textContent), m);
      parents.add(p);
    });
    parents.forEach((p) => p.normalize());
  }

  function isActive() {
    return settings.enabled && !(settings.allowlist || []).includes(HOST);
  }

  function scan() {
    if (!document.body || !isActive()) return;
    applying = true;
    try {
      const nodes = [];
      if (settings.mode === "page") collectTextNodes(document.body, nodes);
      else for (const r of findIngredientRoots()) collectTextNodes(r, nodes);
      for (const n of nodes) if (n.isConnected) highlightNode(n);
    } finally {
      if (observer) observer.takeRecords();
      applying = false;
    }
  }

  function results() {
    const map = new Map();
    document.querySelectorAll("mark." + MARK_CLASS).forEach((m) => {
      const id = m.dataset.clc;
      if (!map.has(id)) {
        const ing = byId.get(id);
        map.set(id, {
          id,
          cat: ing ? ing.cat : "enumber",
          name: { en: labelFor(id, "en"), fr: labelFor(id, "fr") },
          info: { en: infoFor(id, "en"), fr: infoFor(id, "fr") },
          e: ing && ing.e ? ing.e : [],
          count: 0,
          examples: []
        });
      }
      const r = map.get(id);
      r.count++;
      const t = m.textContent.trim();
      if (r.examples.length < 3 && !r.examples.includes(t)) r.examples.push(t);
    });
    const items = [...map.values()].sort((a, b) => b.count - a.count || a.name.en.localeCompare(b.name.en));
    return { host: HOST, active: isActive(), mode: settings.mode, total: items.reduce((s, i) => s + i.count, 0), items };
  }

  function scheduleRescan() {
    clearTimeout(rescanTimer);
    rescanTimer = setTimeout(scan, 900);
  }

  function startObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver((muts) => {
      if (applying || !isActive()) return;
      if (muts.some((m) => m.type === "characterData" || m.addedNodes.length)) scheduleRescan();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
  }

  function apply() {
    clearTimeout(rescanTimer);
    applying = true;
    clearHighlights();
    applying = false;
    if (isActive()) { scan(); startObserver(); } else stopObserver();
  }

  // ---------- messaging with the popup ----------
  api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "clc:getResults") { sendResponse(results()); return; }
    if (msg.type === "clc:rescan") { apply(); sendResponse(results()); return; }
    if (msg.type === "clc:scrollTo") {
      const marks = [...document.querySelectorAll("mark." + MARK_CLASS)].filter((m) => m.dataset.clc === msg.id);
      if (marks.length) {
        const idx = ((msg.index || 0) % marks.length + marks.length) % marks.length;
        const el = marks[idx];
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("clc-flash");
        setTimeout(() => el.classList.remove("clc-flash"), 1600);
      }
      sendResponse({ ok: true, count: marks.length });
      return;
    }
  });

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    let touched = false;
    for (const k of ["enabled", "allowlist", "mode"]) {
      if (changes[k]) { settings[k] = changes[k].newValue; touched = true; }
    }
    if (touched) apply();
  });

  api.storage.local.get({ enabled: true, allowlist: [], mode: "ingredients" }).then((s) => {
    settings = s;
    apply();
  }, () => apply());
})();
