import * as esbuild from 'esbuild'

const outdir = 'dist'

await esbuild.build({
	entryPoints: ['src/index.ts'],
	platform: 'node',
	packages: 'external',
	bundle: true,
	outfile: `${outdir}/index.js`,
})
