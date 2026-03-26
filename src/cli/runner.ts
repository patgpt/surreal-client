import { resolve } from 'node:path'
import { outro, spinner } from '@clack/prompts'
import chalk from 'chalk'
import type { Config } from '../config/types.js'
import { closeDb, connectDb, insertDefinitions } from '../database/db.js'
import { getAllTableInfo } from '../database/getAllTableInfo.js'
import { generateClientJs } from '../genClient/generateClientJs.js'
import { generateTableSchema } from '../genSchema/generateTableSchema.js'
import { printSorry } from '../helper/printSorry.js'
import { readSchemaDefinitions } from '../schema/readSchemaDefinitions.js'
import { label } from './banner.js'

export async function runGeneration(config: Config): Promise<void> {
	const cwd = process.cwd()
	const s = spinner()

	try {
		if (config.schemaFile) {
			s.start(chalk.hex('#00f5ff')('Connecting (in-memory + schema file)…'))
			await connectDb(config, true)
			s.stop(`${label.success} Connected (in-memory)`)

			s.start(chalk.hex('#00f5ff')('Reading schema definitions…'))
			const schemaPath = resolve(cwd, config.schemaFile)
			try {
				const content = await readSchemaDefinitions(config.schemaFile)
				await insertDefinitions(content)
				s.stop(`${label.success} Schema loaded from ${chalk.dim(schemaPath)}`)
			} catch (err) {
				s.stop(`${label.error} Failed to read schema`)
				const e = err as Error & { code?: string }
				if (e.code === 'ENOENT') {
					outro(chalk.hex('#ff003c')(`Schema file not found: ${schemaPath}`))
					process.exit(1)
				}
				throw err
			}
		} else {
			s.start(chalk.hex('#00f5ff')(`Connecting to ${config.surreal}…`))
			await connectDb(config)
			s.stop(`${label.success} Connected to ${chalk.dim(config.surreal)}`)
		}

		s.start(chalk.hex('#00f5ff')('Introspecting tables…'))
		const tableInfo = await getAllTableInfo()
		const tableNames = Object.keys(tableInfo)
		s.stop(
			`${label.success} Found ${chalk.cyan(String(tableNames.length))} table${tableNames.length !== 1 ? 's' : ''}: ` +
				chalk.dim(tableNames.join(', ')),
		)

		const outputDir = resolve(cwd, config.outputFolder)

		s.start(chalk.hex('#00f5ff')('Generating Zod schemas…'))
		await generateTableSchema(outputDir, tableInfo)
		s.stop(`${label.success} Zod schemas written → ${chalk.dim(outputDir)}`)

		if (config.generateClient) {
			s.start(chalk.hex('#00f5ff')('Generating TypeScript client…'))
			await generateClientJs(outputDir, tableNames, 'surrealdb')
			s.stop(`${label.success} Client code written → ${chalk.dim(outputDir)}`)
		}

		outro(
			chalk.hex('#00ff41').bold('Generation complete! ◆') +
				'\n\n' +
				`  ${chalk.dim('⭐  Star us:')} ${chalk.cyan('https://github.com/patgpt/surreal-client')}\n` +
				`  ${chalk.dim('🐛  Issues:')}  ${chalk.cyan('https://github.com/patgpt/surreal-client/issues')}\n\n` +
				chalk.hex('#bf00ff')('  Happy hacking, cyber cowboy. 🤖'),
		)
	} catch (err) {
		s.stop(`${label.error} Generation failed`)
		printSorry(err)
		process.exit(1)
	} finally {
		await closeDb()
	}
}
