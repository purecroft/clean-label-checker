/*
 * Clean Label Checker - popup.
 * Reads results from the content script of the active tab. Settings are kept in storage.local only.
 * Copyright (c) 2026 Pure Croft SASU - MIT License
 */
(function () {
  "use strict";
  const api = globalThis.browser || globalThis.chrome;
  const DATA = globalThis.CLC_DATA;
  const t = (k, subs) => api.i18n.getMessage(k, subs) || k;
  const LANG = (api.i18n.getUILanguage() || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
  document.documentElement.lang = LANG;

  const $ = (id) => document.getElementById(id);
  const els = {
    enabled: $("enabled"), pauseSite: $("pauseSite"), host: $("host"), mode: $("mode"),
    rescan: $("rescan"), list: $("list"), count: $("count"), status: $("status"), allowlist: $("allowlist")
  };
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });

  let tab = null, host = "", settings = { enabled: true, allowlist: [], mode: "ingredients" };
  const scrollIdx = {};

  function send(msg) {
    return new Promise((resolve) => {
      if (!tab) return resolve(null);
      try {
        const p = api.tabs.sendMessage(tab.id, msg);
        if (p && typeof p.then === "function") p.then(resolve, () => resolve(null));
      } catch (e) { resolve(null); }
    });
  }

  function catLabel(cat) {
    const c = DATA.CATEGORIES[cat];
    return c ? c[LANG] : cat;
  }

  function render(res) {
    els.list.textContent = "";
    if (!res) {
      els.count.textContent = "–";
      els.status.textContent = t("unavailable");
      return;
    }
    if (!res.active) {
      els.count.textContent = "–";
      els.status.textContent = settings.enabled ? t("pausedHere") : t("disabled");
      return;
    }
    els.count.textContent = String(res.items.length);
    els.status.textContent = t("occurrences", [String(res.total)]);
    if (!res.items.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = res.mode === "ingredients" ? t("noneIngredients") : t("none");
      els.list.appendChild(li);
      return;
    }
    for (const it of res.items) {
      const li = document.createElement("li");
      const head = document.createElement("div"); head.className = "item-head";
      const name = document.createElement("span"); name.className = "item-name";
      const dot = document.createElement("span"); dot.className = "dot " + it.cat;
      name.append(dot, document.createTextNode(it.name[LANG] || it.name.en));
      const badge = document.createElement("span"); badge.className = "badge"; badge.textContent = "×" + it.count;
      head.append(name, badge);
      const cat = document.createElement("div"); cat.className = "cat";
      cat.textContent = catLabel(it.cat) + (it.e && it.e.length ? " · " + it.e.join(", ") : "") +
        (it.examples.length ? " · “" + it.examples.join("”, “") + "”" : "");
      const info = document.createElement("div"); info.className = "info"; info.textContent = it.info[LANG] || it.info.en;
      li.append(head, cat, info);
      li.title = t("clickToScroll");
      li.addEventListener("click", () => {
        scrollIdx[it.id] = (scrollIdx[it.id] || 0);
        send({ type: "clc:scrollTo", id: it.id, index: scrollIdx[it.id]++ });
      });
      els.list.appendChild(li);
    }
  }

  function renderAllowlist() {
    els.allowlist.textContent = "";
    const list = settings.allowlist || [];
    if (!list.length) {
      const li = document.createElement("li"); li.className = "muted small"; li.textContent = t("allowlistEmpty");
      els.allowlist.appendChild(li); return;
    }
    for (const h of list) {
      const li = document.createElement("li");
      const s = document.createElement("span"); s.textContent = h;
      const b = document.createElement("button"); b.type = "button"; b.textContent = t("remove");
      b.addEventListener("click", async () => {
        settings.allowlist = list.filter((x) => x !== h);
        await api.storage.local.set({ allowlist: settings.allowlist });
        syncControls(); renderAllowlist(); setTimeout(refresh, 150);
      });
      li.append(s, b); els.allowlist.appendChild(li);
    }
  }

  function syncControls() {
    els.enabled.checked = !!settings.enabled;
    els.mode.value = settings.mode || "ingredients";
    els.pauseSite.checked = !!host && (settings.allowlist || []).includes(host);
    els.pauseSite.disabled = !host;
    els.host.textContent = host || "";
  }

  async function refresh() { render(await send({ type: "clc:getResults" })); }

  els.enabled.addEventListener("change", async () => {
    settings.enabled = els.enabled.checked;
    await api.storage.local.set({ enabled: settings.enabled });
    setTimeout(refresh, 150);
  });
  els.mode.addEventListener("change", async () => {
    settings.mode = els.mode.value;
    await api.storage.local.set({ mode: settings.mode });
    setTimeout(refresh, 250);
  });
  els.pauseSite.addEventListener("change", async () => {
    const set = new Set(settings.allowlist || []);
    if (els.pauseSite.checked) set.add(host); else set.delete(host);
    settings.allowlist = [...set].sort();
    await api.storage.local.set({ allowlist: settings.allowlist });
    renderAllowlist(); setTimeout(refresh, 150);
  });
  els.rescan.addEventListener("click", async () => render(await send({ type: "clc:rescan" })));

  (async function init() {
    settings = await api.storage.local.get({ enabled: true, allowlist: [], mode: "ingredients" });
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    tab = tabs && tabs[0];
    try { host = tab && tab.url ? new URL(tab.url).hostname : ""; } catch (e) { host = ""; }
    syncControls(); renderAllowlist(); refresh();
  })();
})();
