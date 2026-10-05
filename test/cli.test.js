import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { run } from "../src/cli.js";

const COLORHUNT = "ffbe91ffddb0fffce1cfebff";
const COOLORS = "https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51";

async function tempDirectory() {
  return mkdtemp(path.join(os.tmpdir(), "base16-from-palette-"));
}

test("CLI writes four schemes and a deterministic HTML preview", async () => {
  const directory = await tempDirectory();
  const argv = [COLORHUNT, "--source", "colorhunt", "--output", directory, "--name", "Spring Glass", "--author", "Test"];
  const first = await run(argv);
  assert.equal(first.length, 5);

  const contents = await Promise.all(first.map((filename) => readFile(filename, "utf8")));
  assert.match(contents[0], /system: "base16"/);
  assert.match(contents[0], /name: "Spring Glass"/);
  assert.match(contents[0], /slug: "spring-glass-light"/);
  assert.match(contents[0], /description: "Generated from https:\/\/colorhunt\.co\/palette\//);
  assert.match(contents[0], /base0F: "#[0-9a-f]{6}"/);
  assert.match(contents[2], /base17: "#[0-9a-f]{6}"/);
  assert.match(contents[4], /<!doctype html>/);
  assert.match(contents[4], /<title>Spring Glass palette preview<\/title>/);
  assert.equal((contents[4].match(/<section class="palette /g) ?? []).length, 4);
  assert.match(contents[4], /Base16 light/);
  assert.match(contents[4], /Base24 dark/);
  assert.match(contents[4], /source 1/);
  assert.match(contents[4], /on Color Hunt/);

  await run(argv);
  const repeated = await Promise.all(first.map((filename) => readFile(filename, "utf8")));
  assert.deepEqual(repeated, contents);
});

test("CLI detects the source from a URL and derives defaults from it", async () => {
  const directory = await tempDirectory();
  const written = await run([COOLORS, "--output", directory]);
  const slug = "coolors-264653-2a9d8f-e9c46a-f4a261-e76f51";
  assert.equal(written[0], path.join(directory, "base16", `${slug}-light.yaml`));

  const yaml = await readFile(written[0], "utf8");
  assert.match(yaml, /name: "Coolors 264653 · 2A9D8F · E9C46A · F4A261 · E76F51"/);
  assert.match(yaml, /author: "Coolors"/);
  assert.match(yaml, /description: "Generated from https:\/\/coolors\.co\/palette\/264653-2a9d8f/);
  assert.match(await readFile(written[4], "utf8"), /source 5/);
});

test("CLI uses --slug for file names", async () => {
  const directory = await tempDirectory();
  const written = await run([COOLORS, "--output", directory, "--name", "Pretty Name", "--slug", "scheme"]);
  assert.equal(written[0], path.join(directory, "base16", "scheme-light.yaml"));
  assert.match(await readFile(written[0], "utf8"), /name: "Pretty Name"/);
});

test("CLI rejects bare palettes without a source", async () => {
  await assert.rejects(run([COLORHUNT]), /select a source/);
});
