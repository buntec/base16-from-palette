# base16-from-palette

Generate matching light and dark [Base16 and Base24](https://github.com/tinted-theming/home) schemes from a palette
on a palette website. Color calculations, OKLCH interpolation, contrast checks, and sRGB gamut mapping use
[Color.js](https://colorjs.io/).

Supported sources:

| Source                            | `source`    | Palette id example                    |
| --------------------------------- | ----------- | ------------------------------------- |
| [Color Hunt](https://colorhunt.co) | `colorhunt` | `ffbe91ffddb0fffce1cfebff` (4 colors) |
| [Coolors](https://coolors.co)     | `coolors`   | `264653-2a9d8f-e9c46a` (2–10 colors)  |

A full palette URL is accepted in place of the id, in which case the source is detected automatically.

## Nix

The flake exports `lib.mkSchemes`, which builds a derivation containing the generated schemes. Its passthru
attributes `base16.light`, `base16.dark`, `base24.light`, `base24.dark`, and `preview` are paths to the
generated files:

```nix
{
  inputs.base16-from-palette.url = "github:buntec/base16-from-palette";

  outputs = { base16-from-palette, ... }: {
    # ... in a NixOS, nix-darwin, or Home Manager module:
    stylix.base16Scheme =
      (base16-from-palette.lib.mkSchemes {
        inherit pkgs;
        source = "coolors";
        palette = "264653-2a9d8f-e9c46a-f4a261-e76f51";
        # or: palette = "https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51";
      }).base24.dark;
  };
}
```

`mkSchemes` arguments:

| Argument    | Description                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `pkgs`      | Package set used to build the generator (required).                         |
| `palette`   | Palette id or URL (required).                                               |
| `source`    | Palette source; optional when `palette` is a URL.                           |
| `name`      | Scheme name; defaults to the source name followed by the colors.            |
| `author`    | Scheme author; defaults to the source name.                                 |
| `slug`      | File name and scheme slug prefix; defaults to a slug of the name or palette. |
| `generator` | Generator package to use instead of building one from `pkgs`.               |

Dependencies are pinned, and generation requires no network access. Tools like Stylix read the generated YAML
during evaluation, which builds the derivation (import from derivation).

The flake also provides the CLI as `packages.<system>.default` and `overlays.default`.

## CLI

```console
nix run github:buntec/base16-from-palette -- https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51
nix run github:buntec/base16-from-palette -- ffbe91ffddb0fffce1cfebff --source colorhunt --name "Spring Glass"
```

Or from a checkout:

```console
npm ci
./bin/base16-from-palette.js ffbe91ffddb0fffce1cfebff --source colorhunt --name "Spring Glass"
```

The command writes four scheme files and a self-contained HTML preview below `generated/` by default (use
`--output` to change it):

```text
generated/
├── spring-glass.html
├── base16/
│   ├── spring-glass-dark.yaml
│   └── spring-glass-light.yaml
└── base24/
    ├── spring-glass-dark.yaml
    └── spring-glass-light.yaml
```

Open the HTML file in a browser to compare the source colors and all four generated palettes.

## Model

The input colors define a shared palette identity: a weighted hue for tinted neutrals, a chroma profile, and
preferred accent hues. Separate lightness profiles render that identity as light and dark schemes. Semantic accent
hues remain recognizable while being pulled toward the nearest source hue. Every accent is adjusted to reach a
WCAG 2.1 contrast ratio of at least 4.5 against `base00`, then gamut-mapped to sRGB using the CSS Color 4 algorithm.

## Adding a source

Sources live in `src/sources/`. Each module exports an object with an `id`, a display `name`, the `hosts` used to
detect it from URLs, a `parse(input)` function returning `#rrggbb` colors, and a `url(colors)` function returning
the palette's canonical URL. See `src/sources/coolors.js` for an example, then:

1. Add the module to the `sources` list in `src/sources/index.js`.
2. Add parsing tests to `test/sources.test.js`.
3. Add an example to `checks` in `flake.nix`.

The Nix library passes `source` through to the CLI, so no Nix changes are needed.

## Development

```console
npm test            # run the tests
nix flake check     # build the package, run the tests, and generate example schemes
nix fmt             # format Nix files
```
