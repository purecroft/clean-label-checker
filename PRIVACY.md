# Privacy Policy – Clean Label Checker

_Last updated: 26 September 2026_

Clean Label Checker is a browser extension published by Pure Croft SASU (https://purecroft.fr).

## Summary: the extension collects no data.

- **No data collection.** The extension does not collect, store, transmit, sell or share any personal data, browsing history, page content or usage statistics.
- **No network requests.** The extension never contacts any server (ours or anyone else's). All ingredient matching happens locally in your browser, on the page you are viewing. There is no analytics, telemetry, tracking pixel, advertising or remote code.
- **Local settings only.** Your on/off setting, scan mode and the list of sites you have paused ("allowlist") are saved with the browser's `storage.local` API on your own device. They are never synced or sent anywhere. Uninstalling the extension deletes them.
- **Page content stays on the page.** The content script reads visible text to find ingredient names and adds highlights. The results are shown only in the extension's own popup and are discarded when you leave or reload the page.

## Permissions and why they are needed

| Permission | Why |
|---|---|
| Access to web pages (`http://*/*`, `https://*/*` content script) | To scan visible text for ingredient lists and highlight matches on the pages you visit. |
| `storage` | To remember your on/off setting, scan mode and paused sites, locally. |
| `activeTab` | So the popup can read the hostname of the current tab (for "Pause on this site") and show that tab's results. |

## Children

The extension collects no information from anyone, including children.

## Changes

If this policy changes, the updated version will be published with the extension and in its source repository.

## Contact

Pure Croft SASU – inquiries@purecroft.fr – https://purecroft.fr
