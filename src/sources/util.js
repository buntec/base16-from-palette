// Helpers shared by palette sources.

// Returns the palette id from either a bare id or a URL on one of `hosts`, where the id is the last path segment.
export function paletteId(input, hosts) {
  const candidate = input.trim();
  if (!/^https?:\/\//i.test(candidate)) return candidate;

  const url = new URL(candidate);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!hosts.includes(host)) throw new Error(`expected a URL on ${hosts.join(" or ")}, got ${url.hostname}`);
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) throw new Error(`URL does not contain a palette: ${candidate}`);
  return segments.at(-1);
}

export function normalizeHex(hex) {
  if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error(`invalid six-digit hex color: ${hex}`);
  return `#${hex.toLowerCase()}`;
}

export function bareHex(color) {
  return color.slice(1);
}
