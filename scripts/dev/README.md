# Dev diagnostics

One-off inspection/debug scripts used while building the prototype (DOM audits,
listener scans, patch helpers). They are not part of the build or the test suite.
Run any of them from anywhere; they resolve paths from the project root:

    node scripts/dev/<script>.js

Note: `patch_talent_discovery.js` and `analyze_configs.js` write files
(`src/views/talent-discovery.html`, `reference/merged_theme.json`).
