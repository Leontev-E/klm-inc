# KLM inc

`KLM inc` is a VS Code extension for automatic cleanup and normalization of `index.html`.

## What it does

- Adds the required PHP block to the first line if it is missing.
- Adds the required `domonetka` + `indexPxl.js` block right after `</title>` if it is missing.
- Detects common JS/CSS libraries and rewrites their links to canonical `cdnjs.cloudflare.com` URLs.
- Replaces suspicious or malformed external links (fake CDN domains, typo domains, etc.) with valid CDNJS links.
- If a recognized library is connected locally, it switches to CDNJS and removes the local library file from the workspace.

## Command

- `KLM inc: Process index.html`

Default keybinding:
- Windows/Linux: `Ctrl+Alt+Shift+P`

## Notes

- The extension processes `index.html` in the active editor, or the first `index.html` found in the workspace.
- Save your project in git before running, because local library files can be removed when migrated to CDNJS.
