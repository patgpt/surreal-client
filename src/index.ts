#!/usr/bin/env bun
import { parseArgs } from 'node:util'
import { renderBanner } from './cli/banner.js'
import { runWizard } from './cli/wizard.js'
import { runGeneration } from './cli/runner.js'
import { configFileSchema } from './config/configFileSchema.js'

const VERSION = '0.0.1'

const HELP = `
  surreal-codegen — SurrealDB TypeScript client generator

  USAGE
    bunx surreal-codegen [flags]

  FLAGS
    -f, --schema-file   SurrealQL file or directory
    -c, --config        Config file (default: surql-gen.json)
    -s, --surreal       SurrealDB URL (default: http://localhost:8000)
    -u, --username      Auth username (default: root)
    -p, --password      Auth password (default: root)
    -n, --ns            Namespace (default: test)
    -d, --db            Database (default: test)
    -o, --output        Output folder (default: client_generated)
        --no-client     Skip TypeScript client generation
    -i, --image         SurrealDB Docker image
    -v, --version       Print version and exit
    -h, --help          Show this help

  Run without flags for the interactive wizard.
`.trimEnd()

const main = async () => {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		allowPositionals: true,
		options: {
			'schema-file': { type: 'string', short: 'f' },
			config: { type: 'string', short: 'c' },
			surreal: { type: 'string', short: 's' },
			username: { type: 'string', short: 'u' },
			password: { type: 'string', short: 'p' },
			ns: { type: 'string', short: 'n' },
			db: { type: 'string', short: 'd' },
			output: { type: 'string', short: 'o' },
			'no-client': { type: 'boolean' },
			image: { type: 'string', short: 'i' },
			version: { type: 'boolean', short: 'v' },
			help: { type: 'boolean', short: 'h' },
		},
	})

	if (values.version) {
		console.log(`surreal-codegen v${VERSION}`)
		process.exit(0)
	}

	if (values.help) {
		console.log(HELP)
		process.exit(0)
	}

	renderBanner(VERSION)

	// Non-interactive mode: all required params provided via flags or config file
	const flags = {
		...(values['schema-file'] ? { schemaFile: values['schema-file'] } : {}),
		...(values.surreal ? { surreal: values.surreal } : {}),
		...(values.username ? { username: values.username } : {}),
		...(values.password ? { password: values.password } : {}),
		...(values.ns ? { ns: values.ns } : {}),
		...(values.db ? { db: values.db } : {}),
		...(values.output ? { outputFolder: values.output } : {}),
		...(values['no-client'] ? { generateClient: false } : {}),
		...(values.image ? { surrealImage: values.image } : {}),
		...(values.config ? { config: values.config } : {}),
	}

	const config = await runWizard({ flags })
	await runGeneration(configFileSchema.parse(config))
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
