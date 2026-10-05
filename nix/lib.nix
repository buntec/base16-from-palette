{
  # Generates light and dark Base16 and Base24 schemes from a palette.
  #
  # Returns a derivation whose passthru exposes the generated files:
  #   base16.light, base16.dark, base24.light, base24.dark, preview
  #
  # The scheme paths can be passed directly to e.g. `stylix.base16Scheme`. Reading them during evaluation builds
  # the derivation (import from derivation).
  mkSchemes =
    {
      # Package set used to build the generator.
      pkgs,
      # Palette id or URL, e.g. "ffbe91ffddb0fffce1cfebff" or "https://coolors.co/palette/264653-2a9d8f".
      palette,
      # Palette source, e.g. "colorhunt" or "coolors". Detected from the palette when it is a URL.
      source ? null,
      # Scheme name (default: derived from the source and colors).
      name ? null,
      # Scheme author (default: the source name).
      author ? null,
      # File name and scheme slug prefix (default: derived from the name or palette).
      slug ? null,
      # Generator package, e.g. to use one built from another nixpkgs.
      generator ? pkgs.callPackage ./package.nix { },
    }:
    let
      inherit (pkgs) lib;

      slugify =
        value:
        lib.concatStringsSep "-" (
          builtins.filter (part: builtins.isString part && part != "") (
            builtins.split "[^a-z0-9]+" (lib.toLower value)
          )
        );

      paletteId = lib.last (
        lib.splitString "/" (lib.removeSuffix "/" (lib.head (lib.splitString "?" palette)))
      );

      fileSlug = slugify (
        if slug != null then
          slug
        else if name != null then
          name
        else
          "${if source != null then source else "palette"}-${paletteId}"
      );

      arguments = [
        palette
        "--output"
        (placeholder "out")
        "--slug"
        fileSlug
      ]
      ++ lib.optionals (source != null) [
        "--source"
        source
      ]
      ++ lib.optionals (name != null) [
        "--name"
        name
      ]
      ++ lib.optionals (author != null) [
        "--author"
        author
      ];

      schemes =
        pkgs.runCommand "base16-${fileSlug}"
          {
            nativeBuildInputs = [ generator ];
            passthru = {
              base16 = lib.genAttrs [ "light" "dark" ] (mode: "${schemes}/base16/${fileSlug}-${mode}.yaml");
              base24 = lib.genAttrs [ "light" "dark" ] (mode: "${schemes}/base24/${fileSlug}-${mode}.yaml");
              preview = "${schemes}/${fileSlug}.html";
            };
          }
          ''
            base16-from-palette ${lib.escapeShellArgs arguments}
          '';
    in
    assert pkgs.lib.assertMsg (fileSlug != "") "base16-from-palette: the scheme slug must not be empty";
    schemes;
}
