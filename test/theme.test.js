import assert from "node:assert/strict";
import test from "node:test";
import Color from "colorjs.io";
import { generateThemes } from "../src/theme.js";

const EXAMPLES = [
  ["#ffbe91", "#ffddb0", "#fffce1", "#cfebff"],
  ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  ["#000000", "#333333", "#cccccc", "#ffffff"],
  ["#ff0000", "#00ff00", "#0000ff", "#ffffff"],
  ["#050505", "#101010", "#181818", "#222222"],
  ["#000000", "#ffffff"],
];

test("generates complete light and dark Base16 and Base24 palettes", () => {
  for (const example of EXAMPLES) {
    const themes = generateThemes(example);
    assert.equal(Object.keys(themes.base16.dark).length, 16);
    assert.equal(Object.keys(themes.base16.light).length, 16);
    assert.equal(Object.keys(themes.base24.dark).length, 24);
    assert.equal(Object.keys(themes.base24.light).length, 24);

    for (const system of ["base16", "base24"]) {
      for (const variant of ["dark", "light"]) {
        const palette = themes[system][variant];
        const lightness = Array.from({ length: 8 }, (_, index) =>
          new Color(palette[`base0${index}`]).to("oklch").coords[0],
        );
        const expectedDirection = variant === "dark" ? 1 : -1;
        for (let index = 1; index < lightness.length; index += 1) {
          assert.ok((lightness[index] - lightness[index - 1]) * expectedDirection > 0);
        }

        const background = new Color(palette.base00);
        assert.ok(background.contrast(new Color(palette.base05), "WCAG21") >= 4.5);
        const accents = ["base08", "base09", "base0A", "base0B", "base0C", "base0D", "base0E", "base0F"];
        if (system === "base24") accents.push("base12", "base13", "base14", "base15", "base16", "base17");
        for (const slot of accents) {
          assert.ok(
            background.contrast(new Color(palette[slot]), "WCAG21") >= 4.5,
            `${example} ${system} ${variant} ${slot}`,
          );
        }
      }
    }
  }
});

test("rejects empty palettes", () => {
  assert.throws(() => generateThemes([]), /at least one/);
});
