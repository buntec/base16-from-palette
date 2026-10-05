import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { themesToHtml } from "./preview.js";
import { resolvePalette, sources } from "./sources/index.js";
import { generateThemes, themeToYaml } from "./theme.js";

function usage() {
  return `Usage: base16-from-palette <palette-or-url> [options]

Generate matching light and dark Base16 and Base24 schemes from one palette.

The source is detected from palette URLs. Pass --source when using a bare palette id.

Options:
  -s, --source <source>     Palette source: ${sources.map(({ id }) => id).join(", ")}
  -o, --output <directory>  Output root (default: generated)
  -n, --name <name>         Scheme name (default: derived from the source and colors)
  -a, --author <author>     Scheme author (default: the source name)
      --slug <slug>         File name and scheme slug prefix (default: derived from the name)
  -h, --help                Show this help
`;
}

function parseArguments(argv) {
  const options = { output: "generated" };
  let input;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "-h" || argument === "--help") return { help: true };
    if (argument === "-s" || argument === "--source") options.source = optionValue(argv, ++index, argument);
    else if (argument === "-o" || argument === "--output") options.output = optionValue(argv, ++index, argument);
    else if (argument === "-n" || argument === "--name") options.name = optionValue(argv, ++index, argument);
    else if (argument === "-a" || argument === "--author") options.author = optionValue(argv, ++index, argument);
    else if (argument === "--slug") options.slug = optionValue(argv, ++index, argument);
    else if (argument.startsWith("-")) throw new Error(`unknown option: ${argument}`);
    else if (input === undefined) input = argument;
    else throw new Error(`unexpected argument: ${argument}`);
  }

  if (!input) throw new Error("missing palette");
  if (!options.output) throw new Error("options must not have empty values");
  return { input, ...options };
}

function optionValue(argv, index, option) {
  const value = argv[index];
  if (!value || value.startsWith("-")) throw new Error(`missing value for ${option}`);
  return value;
}

function fileSlug(name) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function run(argv) {
  const options = parseArguments(argv);
  if (options.help) {
    process.stdout.write(usage());
    return [];
  }

  const { source, colors, url } = resolvePalette(options.input, options.source);
  const themes = generateThemes(colors);
  const bareColors = colors.map((color) => color.slice(1));
  const name = options.name ?? `${source.name} ${bareColors.map((color) => color.toUpperCase()).join(" · ")}`;
  const author = options.author ?? source.name;
  const slug = fileSlug(options.slug ?? options.name ?? `${source.id}-${bareColors.join("-")}`);
  if (!slug) throw new Error("scheme slug must contain at least one letter or number");
  const written = [];

  for (const system of ["base16", "base24"]) {
    const directory = path.resolve(options.output, system);
    await mkdir(directory, { recursive: true });

    for (const variant of ["light", "dark"]) {
      const filename = path.join(directory, `${slug}-${variant}.yaml`);
      const yaml = themeToYaml({
        system,
        name,
        slug: `${slug}-${variant}`,
        author,
        description: `Generated from ${url}`,
        variant,
        palette: themes[system][variant],
      });
      await writeFile(filename, yaml, "utf8");
      written.push(filename);
    }
  }

  const previewFilename = path.resolve(options.output, `${slug}.html`);
  const preview = themesToHtml({
    name,
    author,
    source: url,
    sourceName: source.name,
    sourceColors: colors,
    themes,
  });
  await writeFile(previewFilename, preview, "utf8");
  written.push(previewFilename);

  for (const filename of written) process.stdout.write(`${filename}\n`);
  return written;
}
