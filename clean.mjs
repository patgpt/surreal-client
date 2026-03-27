import { rimraf } from "rimraf";

const buildArtifactGlobs = [
	"dist",
	"src/**/*.js",
	"src/**/*.js.map",
	"src/**/*.d.ts.map",
	"vitest.config.js",
	"vitest.config.js.map",
	"vitest.customMatchers.js",
	"vitest.customMatchers.js.map",
];

await rimraf(buildArtifactGlobs, { glob: true });
