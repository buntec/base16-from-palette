import assert from "node:assert/strict";
import test from "node:test";
import { findSource, resolvePalette, sources } from "../src/sources/index.js";

test("sources have unique ids and the required interface", () => {
  assert.equal(new Set(sources.map(({ id }) => id)).size, sources.length);
  for (const source of sources) {
    assert.equal(typeof source.id, "string");
    assert.equal(typeof source.name, "string");
    assert.ok(Array.isArray(source.hosts) && source.hosts.length > 0);
    assert.equal(typeof source.parse, "function");
    assert.equal(typeof source.url, "function");
  }
});

test("parses Color Hunt ids and URLs", () => {
  const colorhunt = findSource("colorhunt");
  const colors = ["#ffbe91", "#ffddb0", "#fffce1", "#cfebff"];
  assert.deepEqual(colorhunt.parse("FFBE91ffddb0fffce1cfebff"), colors);
  assert.deepEqual(colorhunt.parse("https://colorhunt.co/palette/ffbe91ffddb0fffce1cfebff/"), colors);
  assert.equal(colorhunt.url(colors), "https://colorhunt.co/palette/ffbe91ffddb0fffce1cfebff");
  assert.throws(() => colorhunt.parse("ff00ff"), /exactly four/);
  assert.throws(() => colorhunt.parse("https://coolors.co/palette/ffbe91ffddb0fffce1cfebff"), /colorhunt\.co/);
});

test("parses Coolors ids and URLs", () => {
  const coolors = findSource("coolors");
  const colors = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];
  assert.deepEqual(coolors.parse("264653-2a9d8f-E9C46A-f4a261-e76f51"), colors);
  assert.deepEqual(coolors.parse("https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51"), colors);
  assert.deepEqual(coolors.parse("https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51?ref=x"), colors);
  assert.equal(coolors.url(colors), "https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51");
  assert.deepEqual(coolors.parse("000000-ffffff"), ["#000000", "#ffffff"]);
  assert.throws(() => coolors.parse("264653"), /two to ten/);
  assert.throws(() => coolors.parse(Array(11).fill("264653").join("-")), /two to ten/);
});

test("detects sources from URLs", () => {
  assert.equal(resolvePalette("https://colorhunt.co/palette/ffbe91ffddb0fffce1cfebff").source.id, "colorhunt");
  assert.equal(resolvePalette("https://www.coolors.co/264653-2a9d8f").source.id, "coolors");
  assert.equal(resolvePalette("264653-2a9d8f", "coolors").url, "https://coolors.co/palette/264653-2a9d8f");
  assert.throws(() => resolvePalette("264653-2a9d8f"), /select a source/);
  assert.throws(() => resolvePalette("https://example.com/264653"), /no source/);
  assert.throws(() => resolvePalette("264653-2a9d8f", "nope"), /unknown source "nope"/);
});
