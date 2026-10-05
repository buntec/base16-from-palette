// Color Hunt palettes are four colors concatenated into one 24-character id:
// https://colorhunt.co/palette/ffbe91ffddb0fffce1cfebff
import { bareHex, normalizeHex, paletteId } from "./util.js";

const hosts = ["colorhunt.co"];

export default {
  id: "colorhunt",
  name: "Color Hunt",
  hosts,

  parse(input) {
    const id = paletteId(input, hosts);
    if (!/^[0-9a-f]{24}$/i.test(id)) {
      throw new Error("expected a Color Hunt palette containing exactly four six-digit hex colors");
    }
    return Array.from({ length: 4 }, (_, index) => normalizeHex(id.slice(index * 6, index * 6 + 6)));
  },

  url(colors) {
    return `https://colorhunt.co/palette/${colors.map(bareHex).join("")}`;
  },
};
