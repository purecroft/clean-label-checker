# Clean Label Checker

A small, privacy-first browser extension (Manifest V3, Firefox and Chrome) that scans the ingredient lists on the page you are reading and highlights common fillers, excipients and additives used in food supplements and foods, in **English and French**, including **E-numbers**.

Made by [Pure Croft](https://purecroft.fr). Licensed under MIT.

> The extension gives neutral, factual one-line descriptions of what each ingredient is and what it is typically used for. It does not make health or medical statements and is not a substitute for reading the full label or asking a professional.

## Features

- **Ingredient-list detection**: by default only text near headings such as *Ingredients*, *Ingrédients*, *Other ingredients*, *Autres ingrédients*, *Composition*, *Excipients*, *Supplement Facts*, *Contains / Contient* is scanned. Switch to **Whole visible page** mode from the popup if a site formats its labels differently.
- **~65 ingredient families, EN + FR names, 80+ mapped E-numbers**, including:
  - fillers and excipients: maltodextrin / maltodextrine, dextrin, magnesium stearate / stéarate de magnésium (E470b), stearic acid (E570), microcrystalline cellulose / cellulose microcristalline (E460), dicalcium phosphate (E341), croscarmellose (E468), rice flour / concentrate, modified starch;
  - anti-caking agents: silicon dioxide / dioxyde de silicium / silice (E551), talc (E553b);
  - thickeners and emulsifiers: carrageenan / carraghénane (E407, E407a), xanthan gum (E415), cellulose gum (E466), lecithin (E322), glycerin (E422), polysorbates;
  - capsules and coatings: gelatin / gélatine, hypromellose (E464), shellac (E904);
  - added sugars: dextrose, sucrose / saccharose / sucre, glucose syrup / sirop de glucose, glucose-fructose syrup / HFCS, fructose, malt / rice syrup;
  - sweeteners: sucralose (E955), aspartame (E951), acesulfame K / acésulfame K (E950), saccharin (E954), cyclamate (E952), neotame / advantame, polyols (sorbitol, maltitol, xylitol, erythritol…), steviol glycosides (E960);
  - colours: titanium dioxide / dioxyde de titane (E171), tartrazine (E102), quinoline yellow (E104), sunset yellow (E110), carmine (E120), azorubine (E122), ponceau 4R (E124), erythrosine (E127), allura red (E129), patent blue V (E131), indigotine (E132), brilliant blue (E133), green S (E142), caramel colours (E150a–d), brilliant black (E151), brown HT (E155), iron oxides (E172), plus generic "artificial colours";
  - preservatives: potassium sorbate (E202), sodium benzoate (E211);
  - mushroom sourcing: "mycelium on grain", "myceliated grain / brown rice / oats", "mycelial biomass", "mycélium sur grain", "céréales mycélisées"… and plain "mycelium" (informational);
  - **any other E-number** (E100–E1599) is recognised and labelled with its EU numbering group (colour, preservative, thickener…).
- **Popup**: number of distinct flagged ingredients and total highlights, list with category, E-numbers, matched wording and a short neutral explanation. Click an item to scroll to (and cycle through) its occurrences on the page. Hover a highlight for its explanation.
- **On/off toggle** and **per-site allowlist** ("Pause on this site"; managed in the popup's *Allowlisted sites* section). The checker does not run on allowlisted sites.
- Handles dynamic pages (re-scans after content changes, debounced).
- UI in English and French (follows the browser language).
- **No network requests, no data collection, no remote code.**

## Install

### Firefox (temporary, for testing)
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `dist/clean-label-checker-firefox-1.0.0.zip` (or the `manifest.json` inside an unzipped copy of it).
3. In Firefox, Manifest V3 site access may need to be granted: open the Extensions menu (puzzle icon) → Clean Label Checker → *Always allow on all sites* (or per site).

### Firefox Add-ons (AMO)
Upload `dist/clean-label-checker-firefox-1.0.0.zip` (validated with Mozilla's `addons-linter`: 0 errors, 0 warnings) at https://addons.mozilla.org/developers/. The package includes the gecko id `clean-label-checker@purecroft.fr` and declares `data_collection_permissions: none`. Minimum Firefox version: 140.

### Chrome / Edge / Brave (unpacked)
1. Unzip `dist/clean-label-checker-chrome-1.0.0.zip` (or use this folder directly – it uses `manifest.json`).
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the folder.

## Build

```bash
python3 tools/make_icons.py   # regenerate icons (requires Pillow)
python3 tools/build.py        # writes dist/*-chrome-*.zip and dist/*-firefox-*.zip
node tools/test.js            # optional: runs the matcher against a sample page (requires jsdom)
```

## Project structure

```
manifest.json            Chrome manifest (MV3)
manifest.firefox.json    Generated Firefox manifest (adds browser_specific_settings)
src/data.js              Ingredient dictionary (EN/FR names, E-numbers, neutral descriptions)
src/content.js           Content script: detection, highlighting, messaging
src/content.css          Highlight styles
popup/                   Toolbar popup (HTML/CSS/JS)
_locales/en|fr           UI strings
icons/                   16/32/48/128 px PNG icons
tools/                   Icon generator, build script, test
store-listing/           Store copy (EN + FR)
```

## Privacy

Clean Label Checker **collects no data**. It makes no network requests; everything runs locally on the page. Settings (on/off, scan mode, allowlisted sites) are stored only in your browser's local extension storage. See [PRIVACY.md](PRIVACY.md).

## Limitations

- Matching is text-based: an ingredient mentioned in a sentence (e.g. "free from maltodextrin") inside a detected ingredient block will also be highlighted. Highlights are prompts to read the label, not verdicts.
- Ingredient lists rendered as images or inside iframes from other domains are not scanned.

## Support

inquiries@purecroft.fr · https://purecroft.fr

## License

MIT © 2026 Pure Croft SASU – see [LICENSE](LICENSE).
