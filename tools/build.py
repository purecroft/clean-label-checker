"""Build Chrome and Firefox packages into ../dist/ (pure Python, no zip binary needed)."""
import json, os, zipfile, copy
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")
INCLUDE = ["manifest.json", "src", "popup", "icons", "_locales", "LICENSE", "PRIVACY.md", "README.md"]
GECKO = {"gecko": {"id": "clean-label-checker@purecroft.fr", "strict_min_version": "140.0",
                   "data_collection_permissions": {"required": ["none"]}},
         "gecko_android": {"strict_min_version": "142.0"}}

def files():
    for item in INCLUDE:
        p = os.path.join(ROOT, item)
        if os.path.isfile(p):
            yield item
        else:
            for d, _, fs in os.walk(p):
                for f in sorted(fs):
                    yield os.path.relpath(os.path.join(d, f), ROOT)

def build(target, manifest):
    os.makedirs(DIST, exist_ok=True)
    version = manifest["version"]
    out = os.path.join(DIST, f"clean-label-checker-{target}-{version}.zip")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in files():
            if rel == "manifest.json":
                z.writestr("manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
            else:
                z.write(os.path.join(ROOT, rel), rel.replace(os.sep, "/"))
    print("built", out)
    return out

base = json.load(open(os.path.join(ROOT, "manifest.json")))
build("chrome", base)
ff = copy.deepcopy(base)
ff["browser_specific_settings"] = GECKO
json.dump(ff, open(os.path.join(ROOT, "manifest.firefox.json"), "w"), indent=2)
build("firefox", ff)
