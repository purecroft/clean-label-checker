# Clean Label Checker: store listing copy

Primary target: **Firefox Add-ons (AMO)**. Chrome Web Store is on hold for now (it charges a developer registration fee); the Chrome package and copy are ready for when it's needed.

- **Name:** Clean Label Checker
- **Developer / publisher:** Pure Croft SASU
- **Support email:** inquiries@purecroft.fr
- **Homepage:** https://purecroft.fr
- **Support site:** https://purecroft.fr
- **License:** MIT
- **Privacy policy:** contents of `PRIVACY.md` (paste into the AMO "Privacy Policy" field)
- **Data collection (AMO):** none (`data_collection_permissions: { required: ["none"] }`)
- **Firefox package:** `dist/clean-label-checker-firefox-1.0.0.zip` (gecko id `clean-label-checker@purecroft.fr`, Firefox 140+ / Android 142+)
- **Chrome package:** `dist/clean-label-checker-chrome-1.0.0.zip`

## Category suggestions

| Store | Suggested category | Alternative |
|---|---|---|
| Firefox Add-ons | **Shopping** | Other / Search Tools |
| Chrome Web Store | **Shopping** | Tools (Productivity) |

Suggested tags (AMO): shopping, food, ingredients, privacy, accessibility

---

## English

### Name
Clean Label Checker

### Summary / short description (≤132 characters)
Highlights common fillers, excipients and additives in ingredient lists (EN/FR names + E-numbers). Works offline, collects no data.

### Long description
Reading supplement and food labels online? Clean Label Checker highlights common fillers, excipients and additives in the ingredient lists on the page you're viewing, so you can see what's in a product at a glance.

What it spots (English and French names, plus E-numbers):
• Fillers and excipients: maltodextrin, magnesium stearate, microcrystalline cellulose, dicalcium phosphate, rice flour and more
• Anti-caking agents: silicon dioxide (E551), talc
• Thickeners and emulsifiers: carrageenan (E407), xanthan gum, lecithin, glycerin
• Capsules and coatings: gelatin, hypromellose, shellac
• Added sugars: dextrose, sucrose, glucose syrup, glucose-fructose syrup
• Sweeteners: sucralose, aspartame, acesulfame K, saccharin, polyols, steviol glycosides
• Colours: titanium dioxide (E171), tartrazine, allura red, brilliant blue, caramel colours and other E1xx colours
• Mushroom products: "mycelium on grain" and "myceliated grain" wording
• Any other E-number, labelled with its EU additive group

How it works:
• Click the toolbar icon to see how many flagged ingredients the page has, with a short, neutral one-line note on what each one is and what it's typically used for
• Click an item to jump to it on the page, or hover a highlight to read its note
• Scan only the detected ingredient lists (default) or the whole visible page
• Switch it on or off at any time, and pause it on any site with the per-site allowlist
• English and French interface

Privacy first:
• Collects no data. No analytics, no tracking, no accounts
• Makes no network requests. Everything runs locally in your browser
• Your settings stay in your browser's local storage

The notes are general, factual information about ingredients. They are not health or medical advice, and a highlight isn't a verdict on a product. Always read the full label.

Free and open source (MIT). Made by Pure Croft, https://purecroft.fr. Questions: inquiries@purecroft.fr

### Permission justifications (for reviewers)
- Content script on http/https pages: scans visible text for ingredient names and adds highlights locally.
- storage: saves on/off, scan mode and paused sites locally.
- activeTab: lets the popup read the current tab's hostname for "Pause on this site" and show that tab's results.
- No remote code, no network access.

### Notes to reviewer (AMO)
No build step or minification: the source in the package is the source. There are no external libraries. To test, open any product page with an "Ingredients" section (for example a supplement shop page), click the toolbar icon, and try "Whole visible page" mode.

---

## Français

### Nom
Clean Label Checker

### Résumé / description courte (≤132 caractères)
Surligne charges, excipients et additifs courants dans les listes d'ingrédients (FR/EN, numéros E). Hors ligne, zéro collecte.

### Description longue
Vous lisez des étiquettes de compléments alimentaires ou d'aliments en ligne ? Clean Label Checker surligne les charges, excipients et additifs courants dans les listes d'ingrédients de la page que vous consultez, pour voir d'un coup d'œil ce que contient un produit.

Ce qu'il repère (noms français et anglais, plus numéros E) :
• Charges et excipients : maltodextrine, stéarate de magnésium, cellulose microcristalline, phosphate dicalcique, farine de riz…
• Antiagglomérants : dioxyde de silicium / silice (E551), talc
• Épaississants et émulsifiants : carraghénane (E407), gomme xanthane, lécithine, glycérine
• Gélules et enrobages : gélatine, hypromellose, gomme-laque
• Sucres ajoutés : dextrose, saccharose, sirop de glucose, sirop de glucose-fructose
• Édulcorants : sucralose, aspartame, acésulfame K, saccharine, polyols, glycosides de stéviol
• Colorants : dioxyde de titane (E171), tartrazine, rouge allura, bleu brillant, caramels colorants et autres colorants E1xx
• Produits à base de champignons : les mentions « mycélium sur grain » et « céréales mycélisées »
• Tout autre numéro E, avec sa famille d'additifs selon la classification européenne

Fonctionnement :
• Cliquez sur l'icône pour voir le nombre d'ingrédients signalés sur la page, avec pour chacun une note neutre d'une ligne : ce que c'est et à quoi il sert habituellement
• Cliquez sur un élément pour le retrouver dans la page, ou survolez un surlignage pour lire sa note
• Analyse des seules listes d'ingrédients détectées (par défaut) ou de toute la page visible
• Activation/désactivation à tout moment, et mise en pause site par site grâce à la liste d'exceptions
• Interface en français et en anglais

La confidentialité avant tout :
• Aucune donnée collectée. Ni statistiques, ni pistage, ni compte
• Aucune requête réseau : tout s'exécute localement dans votre navigateur
• Vos réglages restent dans le stockage local de votre navigateur

Les notes donnent des informations générales et factuelles sur les ingrédients. Elles ne constituent pas un avis médical ou de santé, et un surlignage n'est pas un jugement sur un produit. Lisez toujours l'étiquette complète.

Gratuit et open source (MIT). Réalisé par Pure Croft, https://purecroft.fr. Contact : inquiries@purecroft.fr

### Justification des permissions
- Script de contenu sur les pages http/https : analyse le texte visible pour repérer les noms d'ingrédients et les surligner, localement.
- storage : enregistre localement l'activation, le mode d'analyse et les sites en pause.
- activeTab : permet au popup de lire le nom de domaine de l'onglet actif (« Mettre en pause sur ce site ») et d'afficher ses résultats.
- Aucun code distant, aucun accès réseau.
