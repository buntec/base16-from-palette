// Registry of palette sources.
//
// A source is a module whose default export has this shape:
//
//   {
//     id: "example",                 // value accepted by --source and the Nix `source` argument
//     name: "Example",               // human-readable name used in scheme metadata and previews
//     hosts: ["example.com"],        // hostnames used to detect the source from a URL
//     parse(input) -> ["#rrggbb"],   // accepts the source's palette id or a full URL
//     url(colors) -> string,         // canonical URL of the palette on the source's website
//   }
//
// To add a source, create a module next to this file and add it to `sources` below.

import colorhunt from "./colorhunt.js";
import coolors from "./coolors.js";

export const sources = [colorhunt, coolors];

export function findSource(id) {
  const source = sources.find((candidate) => candidate.id === id);
  if (!source) {
    throw new Error(`unknown source "${id}" (available: ${sources.map(({ id }) => id).join(", ")})`);
  }
  return source;
}

function detectSource(input) {
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error(`cannot detect the source of "${input}"; pass a URL or select a source explicitly`);
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const source = sources.find((candidate) => candidate.hosts.includes(host));
  if (!source) throw new Error(`no source is registered for host "${url.hostname}"`);
  return source;
}

// Resolves a palette id or URL to its source and colors. The source is detected from URLs when `sourceId` is
// omitted.
export function resolvePalette(input, sourceId) {
  const source = sourceId ? findSource(sourceId) : detectSource(input);
  const colors = source.parse(input);
  return { source, colors, url: source.url(colors) };
}
