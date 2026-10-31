# Dependency review — 31 October 2026

The affected minimatch 10.2.6 branch used by typescript-estree was upgraded to patched 11.0.1 or later via a scoped override. Legacy ESLint plugins still require the callable v3 API; a global major override would silently break some rules.

The npm advisory GHSA-g3hv-75wg-m249 applies a broad `<11.0.1` range, producing 15 propagated package warnings on the remaining minimatch 3.1.5 chain. Its described vulnerability is the optimizationLevel >= 2 firstPhasePreProcess globparts amplification introduced in the newer implementation. The installed v3 source contains neither implementation. This exact legacy source is reviewed as not affected by that specific code path; this is not a blanket waiver of development vulnerabilities.

The daily evaluator preserves raw findings and expires this disposition after 30 November 2026. A changed file/hash/version, new advisory/severity, missing node or expired review fails the check. Never use npm audit fix --force to downgrade ESLint or break its API merely to make a count zero. Recheck upstream compatibility and remove this temporary disposition once compatible patched dependencies exist.

Source: https://github.com/advisories/GHSA-g3hv-75wg-m249

No production minimatch dependency was found (`npm ls minimatch --omit=dev`). Re-evaluate if dependencies change; this does not certify all production code as secure.
