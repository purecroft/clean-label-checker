// Smoke test: run data.js + content.js in jsdom against a sample page and print detected items.
// Usage: NODE_PATH=/path/to/node_modules node tools/test.js
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const root = path.join(__dirname, "..");
const html = `<!doctype html><html><body>
<h1>Sample capsule product</h1>
<p>Our story: free from nothing in particular. Price 20 E. page 200.</p>
<div class="label"><h3>Ingredients</h3>
<p>Mushroom powder (myceliated brown rice), maltodextrin, capsule shell: gelatin, anti-caking agent: magnesium stearate, E551, colour: E171, E 133, sucralose, acesulfame K, glucose-fructose syrup, carrageenan (E407), E415, E-999.</p></div>
<div><strong>Ingrédients :</strong> extrait de champignon, maltodextrine, stéarate de magnésium, dioxyde de silicium, sirop de glucose, dioxyde de titane, mycélium sur grain, gélatine bovine, E150d.</div>
<p>Unrelated paragraph mentioning sugar and gelatin outside any list.</p>
</body></html>`;
let listener;
const store = { enabled: true, allowlist: [], mode: "ingredients" };
const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
const w = dom.window;
w.Element.prototype.checkVisibility = () => true;
w.chrome = {
  runtime: { onMessage: { addListener: (f) => (listener = f) } },
  storage: { local: { get: async (d) => Object.assign({}, d, store) }, onChanged: { addListener() {} } }
};
w.eval(fs.readFileSync(path.join(root, "src/data.js"), "utf8"));
w.eval(fs.readFileSync(path.join(root, "src/content.js"), "utf8"));
function ask(msg) { return new Promise((r) => listener(msg, {}, r)); }
setTimeout(async () => {
  let res = await ask({ type: "clc:getResults" });
  console.log("MODE ingredients: distinct =", res.items.length, "total =", res.total);
  for (const i of res.items) console.log(" -", i.name.en, "x" + i.count, JSON.stringify(i.examples));
  const outside = [...w.document.querySelectorAll("p")].pop().querySelectorAll("mark").length;
  console.log("marks in unrelated paragraph:", outside);
  const falseE = w.document.body.innerHTML.includes('data-clc="E:E200"');
  console.log("false positive on 'page 200':", falseE);
  let fail = 0;
  const need = ["maltodextrin", "magnesium-stearate", "silicon-dioxide", "titanium-dioxide", "brilliant-blue", "sucralose", "acesulfame", "hfcs", "carrageenan", "xanthan", "gelatin", "myceliated-grain", "glucose-syrup", "caramel-colour", "E:E999"];
  for (const n of need) if (!res.items.find((i) => i.id === n)) { console.log("MISSING", n); fail++; }
  if (outside !== 0 || falseE) fail++;
  // whole page mode
  store.mode = "page";
  const r2 = await ask({ type: "clc:rescan" });
  console.log("rescan ok, total =", r2.total);
  console.log(fail ? `FAIL (${fail})` : "PASS");
  process.exit(fail ? 1 : 0);
}, 300);
