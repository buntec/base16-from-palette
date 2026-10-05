{
  description = "Generate Base16 and Base24 schemes from Color Hunt, Coolors, and other palettes";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;

      eachSystem = lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      pkgsFor = system: nixpkgs.legacyPackages.${system};
    in
    {
      lib = import ./nix/lib.nix;

      overlays.default = final: _prev: {
        base16-from-palette = final.callPackage ./nix/package.nix { };
      };

      packages = eachSystem (
        system:
        let
          base16-from-palette = (pkgsFor system).callPackage ./nix/package.nix { };
        in
        {
          inherit base16-from-palette;
          default = base16-from-palette;
        }
      );

      checks = eachSystem (
        system:
        let
          pkgs = pkgsFor system;
          generator = self.packages.${system}.default;
          mkSchemes = args: self.lib.mkSchemes ({ inherit pkgs generator; } // args);
        in
        {
          package = generator;

          colorhunt = mkSchemes {
            source = "colorhunt";
            palette = "ffbe91ffddb0fffce1cfebff";
          };

          coolors = mkSchemes {
            palette = "https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51";
            name = "Coolors Example";
          };

          formatting = pkgs.runCommand "check-formatting" { nativeBuildInputs = [ pkgs.nixfmt ]; } ''
            nixfmt --check ${
              lib.concatMapStringsSep " " toString (
                lib.fileset.toList (lib.fileset.fileFilter (file: file.hasExt "nix") ./.)
              )
            }
            touch $out
          '';
        }
      );

      devShells = eachSystem (system: {
        default = (pkgsFor system).mkShell {
          packages = [ (pkgsFor system).nodejs ];
        };
      });

      formatter = eachSystem (system: (pkgsFor system).nixfmt-tree);
    };
}
