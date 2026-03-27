import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mkdirp } from "mkdirp";

export const ensureRecordSchema = async (rootPath: string) => {
	const content = `import { z } from 'zod'
import { RecordId } from 'surrealdb'

const RecordIdValue = z.union([z.string(), z.number(), z.bigint(), z.record(z.string(), z.unknown()), z.array(z.unknown())])

type RecordIdValue = z.infer<typeof RecordIdValue>

const getRecordIdTable = (value: RecordId<string>) => value.table.name

const coerceRecordIdValue = (value: string): RecordIdValue => {
	const trimmed = value.trim()

	if (/^-?\\d+$/.test(trimmed)) {
		const numeric = Number(trimmed)
		if (Number.isSafeInteger(numeric)) {
			return numeric
		}
	}

	if (
		(trimmed.startsWith('{') && trimmed.endsWith('}')) ||
		(trimmed.startsWith('[') && trimmed.endsWith(']'))
	) {
		try {
			return RecordIdValue.parse(JSON.parse(trimmed))
		} catch {
			return value
		}
	}

	return value
}

const createRecordIdFromString = <Table extends string>(value: string): RecordId<Table> => {
	const separatorIndex = value.indexOf(':')
	if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
		throw new Error('Invalid record ID string format')
	}

	const tb = value.slice(0, separatorIndex)
	const id = value.slice(separatorIndex + 1)
	return new RecordId(tb, coerceRecordIdValue(id)) as RecordId<Table>
}

export function recordId<Table extends string = string>(table?: Table) {
	const tableRegex = table ? table : '[A-Za-z_][A-Za-z0-9_]*'
	const idRegex = '.+'
	const fullRegex = new RegExp(\`^\${tableRegex}:\${idRegex}$\`)

	return z
		.union([
			z
				.custom<RecordId<string>>((val): val is RecordId<string> => val instanceof RecordId)
				.refine((val): val is RecordId<Table> => !table || getRecordIdTable(val) === table, {
					message: table ? \`RecordId must be of type '\${table}'\` : undefined,
				}),
			z.string().regex(fullRegex, {
				message: table
					? \`Invalid record ID format. Must be '\${table}:id'\`
					: "Invalid record ID format. Must be 'table:id'",
			}),
			z.object({
				rid: z.string().regex(fullRegex),
			}),
			z
				.object({
					tb: z.string(),
					id: z.union([z.string(), z.number(), z.record(z.string(), z.unknown())]),
				})
				.refine(val => !table || val.tb === table, {
					message: table ? \`RecordId must be of type '\${table}'\` : undefined,
				}),
		])
		.transform((val): RecordId<Table> => {
			if (val instanceof RecordId) {
				return val as RecordId<Table>
			}
			if (typeof val === 'string') {
				return createRecordIdFromString<Table>(val)
			}
			if ('rid' in val) {
				return createRecordIdFromString<Table>(val.rid)
			}
			if ('tb' in val && 'id' in val) {
				return new RecordId(val.tb, val.id) as RecordId<Table>
			}
			throw new Error('Invalid input for RecordId')
		});
  }`;

	await mkdirp(rootPath);

	const fileName = join(rootPath, "recordSchema.ts");

	console.log(fileName);
	if (!existsSync(fileName)) {
		writeFileSync(fileName, content, { flag: "wx" });
	}
};
