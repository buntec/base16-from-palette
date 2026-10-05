// Coolors palettes are two to ten dash-separated colors:
// https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51 or https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51
import { bareHex, normalizeHex, paletteId } from "./util.js";

const hosts = ["coolors.co"];

export default {
  id: "coolors",
  name: "Coolors",
  hosts,

  parse(input) {
    const id = paletteId(input, hosts);
    if (!/^[0-9a-f]{6}(-[0-9a-f]{6}){1,9}$/i.test(id)) {
      throw new Error("expected a Coolors palette containing two to ten dash-separated six-digit hex colors");
    }
    return id.split("-").map(normalizeHex);
  },

  url(colors) {
    return `https://coolors.co/palette/${colors.map(bareHex).join("-")}`;
  },
};
