import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
	cancel,
	confirm,
	group,
	intro,
	isCancel,
	log,
	note,
	password,
	text,
} from "@clack/prompts";
import chalk from "chalk";
import type { Config } from "../config/types.js";

const DEFAULT_ENDPOINT = "http://localhost:8000";
const DEFAULT_NS = "test";
const DEFAULT_DB = "test";
const DEFAULT_USER = "root";
const DEFAULT_OUTPUT = "client_generated";
const DEFAULT_IMAGE = "surrealdb/surrealdb:latest";

function handleCancel(_value?: unknown): never {
	cancel(chalk.hex("#ff003c")("Cancelled. Goodbye, traveller. 👾"));
	process.exit(0);
}

function guard<T>(value: T | symbol): T {
	if (isCancel(value)) handleCancel(value);
	return value as T;
}

export interface WizardOptions {
	/** Pre-filled values from CLI flags, bypasses interactive prompts for any that are set */
	flags?: Partial<Config & { config?: string }>;
}

async function tryLoadConfigFile(path: string): Promise<Partial<Config>> {
	try {
		const raw = await readFile(path, "utf8");
		return JSON.parse(raw) as Partial<Config>;
	} catch {
		return {};
	}
}

export async function runWizard(
	opts: WizardOptions = {},
): Promise<Config & { configPath: string }> {
	const flags = opts.flags ?? {};
	const cfgPath = resolve(
		process.cwd(),
		flags.config ?? "surreal-codegen.config.json",
	);
	const existingConfig = await tryLoadConfigFile(cfgPath);
	const hasExisting = existsSync(cfgPath);

	intro(
		chalk.cyan("◆ ") +
			chalk.bold("SurrealDB Codegen") +
			chalk.dim(" — configuration wizard"),
	);

	if (hasExisting) {
		note(
			[
				`${chalk.cyan("endpoint")}  ${chalk.white(existingConfig.surreal ?? DEFAULT_ENDPOINT)}`,
				`${chalk.cyan("namespace")} ${chalk.white(existingConfig.ns ?? DEFAULT_NS)}`,
				`${chalk.cyan("database")}  ${chalk.white(existingConfig.db ?? DEFAULT_DB)}`,
				`${chalk.cyan("output")}    ${chalk.white(existingConfig.outputFolder ?? DEFAULT_OUTPUT)}`,
			].join("\n"),
			chalk.hex("#bf00ff")("Existing config found"),
		);

		const useCached = guard(
			await confirm({
				message: "Use existing config?",
				initialValue: true,
			}),
		);

		if (useCached) {
			log.success(
				chalk.hex("#00ff41")("Loaded config from ") + chalk.dim(cfgPath),
			);
			return {
				surreal: DEFAULT_ENDPOINT,
				ns: DEFAULT_NS,
				db: DEFAULT_DB,
				username: DEFAULT_USER,
				password: DEFAULT_USER,
				outputFolder: DEFAULT_OUTPUT,
				generateClient: true,
				surrealImage: DEFAULT_IMAGE,
				...existingConfig,
				configPath: cfgPath,
			} as Config & { configPath: string };
		}
	}

	log.step(chalk.hex("#00f5ff")("◈ Connection setup"));

	const connection = await group(
		{
			surreal: () =>
				text({
					message: chalk.cyan("SurrealDB endpoint"),
					placeholder: DEFAULT_ENDPOINT,
					defaultValue:
						flags.surreal ?? existingConfig.surreal ?? DEFAULT_ENDPOINT,
					validate: (v) => {
						if (v && !/^https?:\/\/.+/.test(v))
							return "Must be a valid HTTP/S URL";
					},
				}),
			ns: () =>
				text({
					message: chalk.cyan("Namespace"),
					placeholder: DEFAULT_NS,
					defaultValue: flags.ns ?? existingConfig.ns ?? DEFAULT_NS,
				}),
			db: () =>
				text({
					message: chalk.cyan("Database"),
					placeholder: DEFAULT_DB,
					defaultValue: flags.db ?? existingConfig.db ?? DEFAULT_DB,
				}),
			username: () =>
				text({
					message: chalk.cyan("Username"),
					placeholder: DEFAULT_USER,
					defaultValue:
						flags.username ?? existingConfig.username ?? DEFAULT_USER,
				}),
			password: () =>
				password({
					message: chalk.cyan("Password"),
					mask: chalk.hex("#bf00ff")("●"),
				}),
		},
		{ onCancel: () => handleCancel(null) },
	);

	log.step(chalk.hex("#00f5ff")("◈ Output setup"));

	const output = await group(
		{
			outputFolder: () =>
				text({
					message: chalk.cyan("Output folder"),
					placeholder: DEFAULT_OUTPUT,
					defaultValue:
						flags.outputFolder ?? existingConfig.outputFolder ?? DEFAULT_OUTPUT,
				}),
			schemaFile: () =>
				text({
					message:
						chalk.cyan("Schema file path") +
						chalk.dim(" (leave blank to connect live)"),
					placeholder: "path/to/schema.surql",
					defaultValue: flags.schemaFile ?? existingConfig.schemaFile ?? "",
				}),
			generateClient: () =>
				confirm({
					message: chalk.cyan("Generate TypeScript client?"),
					initialValue:
						flags.generateClient ?? existingConfig.generateClient ?? true,
				}),
			surrealImage: () =>
				text({
					message: chalk.cyan("SurrealDB Docker image"),
					placeholder: DEFAULT_IMAGE,
					defaultValue:
						flags.surrealImage ?? existingConfig.surrealImage ?? DEFAULT_IMAGE,
				}),
		},
		{ onCancel: () => handleCancel(null) },
	);

	const config: Config & { configPath: string } = {
		surreal: (connection.surreal as string) || DEFAULT_ENDPOINT,
		ns: (connection.ns as string) || DEFAULT_NS,
		db: (connection.db as string) || DEFAULT_DB,
		username: (connection.username as string) || DEFAULT_USER,
		password: (connection.password as string) || DEFAULT_USER,
		outputFolder: (output.outputFolder as string) || DEFAULT_OUTPUT,
		schemaFile: (output.schemaFile as string) || undefined,
		generateClient: output.generateClient as boolean,
		surrealImage: (output.surrealImage as string) || DEFAULT_IMAGE,
		configPath: cfgPath,
	};

	const saveConfig = guard(
		await confirm({
			message:
				chalk.cyan("Save config to ") +
				chalk.dim("surreal-codegen.config.json") +
				chalk.cyan("?"),
			initialValue: true,
		}),
	);

	if (saveConfig) {
		const { configPath: _, ...toSave } = config;
		await writeFile(cfgPath, JSON.stringify(toSave, null, 2), "utf8");
		log.success(chalk.hex("#00ff41")("Config saved → ") + chalk.dim(cfgPath));
	}

	return config;
}
