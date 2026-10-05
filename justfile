open := if os() == "macos" { "open" } else { "xdg-open" }

# list recipes
default:
    just --list

# Reformat all Nix sources
format:
    nix fmt

# Build the package, run the tests, and generate the example schemes
check:
    nix flake check -L

# Run the JavaScript tests with the dev shell's Node.js
test: install
    nix develop -c npm test

# Install npm dependencies with the dev shell's Node.js
install:
    [ -d node_modules ] || nix develop -c npm ci

# Generate schemes below generated/, e.g. just generate https://coolors.co/palette/264653-2a9d8f --name "My Theme"
[positional-arguments]
generate palette *args:
    nix run . -- "$@"

# Generate schemes and open the HTML preview
[positional-arguments]
preview palette *args:
    nix run . -- "$@" | tail -n 1 | xargs {{ open }}

# Recompute npmDepsHash in nix/package.nix after changing package-lock.json
update-npm-hash:
    #!/usr/bin/env sh
    set -eu
    hash=$(nix run --inputs-from . nixpkgs#prefetch-npm-deps -- package-lock.json)
    sed -i.bak "s#npmDepsHash = \"[^\"]*\"#npmDepsHash = \"$hash\"#" nix/package.nix
    rm nix/package.nix.bak
    echo "npmDepsHash = $hash"

# Update flake inputs
update:
    nix flake update

# Remove generated schemes, build results, and npm dependencies
clean:
    rm -rf generated node_modules result result-*
