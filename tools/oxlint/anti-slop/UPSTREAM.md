# Vendored anti-slop

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), commit `13909c9e07590f5a85d93c62712259fe14a883f7`.

Installed with `skills/install-anti-slop/scripts/install.mjs` from that commit. The files under this directory are the
unmodified contents of `skills/install-anti-slop/assets/anti-slop/`, including `vendor/eslint-stylistic/` with its own
`UPSTREAM.md` and license.

Deviations: none. Biome and tsc exclude this directory (`biome.json`, `tsconfig.json`), and `.oxlintrc.json` ignores it.

Registered through `jsPlugins` in `/.oxlintrc.json`. The opt-in Effect rules in `effect/` are not enabled because the
repository does not depend on `effect`.

Dependencies: `oxlint` and `@oxlint/plugins`, both pinned at 1.78.0.
