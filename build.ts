import { chmodSync } from "node:fs";
import { mkdir } from "node:fs/promises";

const outdir = "./dist";
const outfile = `${outdir}/index.js`;
const shebang = "#!/usr/bin/env bun";

await mkdir(outdir, { recursive: true });

await Bun.build({
	entrypoints: ["./src/index.ts"],
	target: "bun",
	packages: "external",
	outdir,
	naming: "[name].[ext]",
	format: "esm",
	minify: true,
	env: "inline",
});

const contents = await Bun.file(outfile).text();
const output = contents.startsWith(shebang) ? contents : `${shebang}\n${contents}`;

await Bun.write(outfile, output);
chmodSync(outfile, 0o755);
