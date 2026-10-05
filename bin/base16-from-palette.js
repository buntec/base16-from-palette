#!/usr/bin/env node

import process from "node:process";
import { run } from "../src/cli.js";

run(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`base16-from-palette: ${error.message}\n`);
  process.exitCode = 1;
});
