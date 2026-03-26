import * as esbuild from 'esbuild'

const outdir = 'dist'

await esbuild.build({
	entryPoints: ['src/index.ts'],
	banner: {
		js: '#!/usr/bin/env bun',
	},
	platform: 'node',
	packages: 'external',
	bundle: true,
	outfile: `${outdir}/index.js`,
	format: 'esm',
	target: 'esnext',
	minify: true,
})
