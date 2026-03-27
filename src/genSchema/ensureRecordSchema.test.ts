import { describe, expect, test } from "bun:test";
import z from "zod";

const RecordIdValue = z.union([
	z.string(),
	z.number(),
	z.bigint(),
	z.record(z.string(), z.unknown()),
	z.array(z.unknown()),
]);

type RecordIdValue = z.infer<typeof RecordIdValue>;

class RecordId<
	Tb extends string = string,
	Id extends RecordIdValue = RecordIdValue,
> {
	readonly table: { name: Tb };

	constructor(
		table: Tb,
		readonly id: Id,
	) {
		this.table = { name: table };
	}
}

const getRecordIdTable = (value: RecordId<string>) => value.table.name;

const coerceRecordIdValue = (value: string): RecordIdValue => {
	const trimmed = value.trim();

	if (/^-?\d+$/.test(trimmed)) {
		const numeric = Number(trimmed);
		if (Number.isSafeInteger(numeric)) {
			return numeric;
		}
	}

	if (
		(trimmed.startsWith("{") && trimmed.endsWith("}")) ||
		(trimmed.startsWith("[") && trimmed.endsWith("]"))
	) {
		try {
			return RecordIdValue.parse(JSON.parse(trimmed));
		} catch {
			return value;
		}
	}

	return value;
};

const createRecordIdFromString = <Table extends string>(
	value: string,
): RecordId<Table> => {
	const separatorIndex = value.indexOf(":");
	if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
		throw new Error("Invalid record ID string format");
	}

	const tb = value.slice(0, separatorIndex);
	const id = value.slice(separatorIndex + 1);
	return new RecordId(tb, coerceRecordIdValue(id)) as RecordId<Table>;
};

function recordId<Table extends string = string>(table?: Table) {
	const tableRegex = table ? table : "[A-Za-z_][A-Za-z0-9_]*";
	const idRegex = ".+";
	const fullRegex = new RegExp(`^${tableRegex}:${idRegex}$`);

	return z
		.union([
			z
				.custom<RecordId<string>>(
					(val): val is RecordId<string> => val instanceof RecordId,
				)
				.refine(
					(val): val is RecordId<Table> =>
						!table || getRecordIdTable(val) === table,
					{
						message: table ? `RecordId must be of type '${table}'` : undefined,
					},
				),
			z.string().regex(fullRegex, {
				message: table
					? `Invalid record ID format. Must be '${table}:id'`
					: "Invalid record ID format. Must be 'table:id'",
			}),
			z.object({
				rid: z.string().regex(fullRegex),
			}),
			z
				.object({
					tb: z.string(),
					id: z.union([
						z.string(),
						z.number(),
						z.record(z.string(), z.unknown()),
					]),
				})
				.refine((val) => !table || val.tb === table, {
					message: table ? `RecordId must be of type '${table}'` : undefined,
				}),
		])
		.transform((val): RecordId<Table> => {
			if (val instanceof RecordId) {
				return val as RecordId<Table>;
			}
			if (typeof val === "string") {
				return createRecordIdFromString<Table>(val);
			}
			if ("rid" in val) {
				return createRecordIdFromString<Table>(val.rid);
			}
			if ("tb" in val && "id" in val) {
				return new RecordId(val.tb, val.id) as RecordId<Table>;
			}
			throw new Error("Invalid input for RecordId");
		});
}

describe("recordId type tests", () => {
	const createRecordId = (tb: string, id: RecordIdValue) =>
		new RecordId(tb, id);

	test("accepts existing RecordId instances", () => {
		const result = recordId().safeParse(createRecordId("internet", "test"));
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBeInstanceOf(RecordId);
			expect(getRecordIdTable(result.data)).toBe("internet");
			expect(result.data.id).toBe("test");
		}
	});

	test("accepts string record ids", () => {
		const result = recordId().safeParse("internet:test");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBeInstanceOf(RecordId);
			expect(getRecordIdTable(result.data)).toBe("internet");
			expect(result.data.id).toBe("test");
		}
	});

	test("coerces numeric string ids", () => {
		const result = recordId().safeParse("internet:9000");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe(9000);
		}
	});

	test("coerces JSON object string ids", () => {
		const objectId = { location: "London", date: new Date().toISOString() };
		const result = recordId().safeParse(
			`temperature:${JSON.stringify(objectId)}`,
		);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(getRecordIdTable(result.data)).toBe("temperature");
			expect(result.data.id).toEqual(objectId);
		}
	});

	test("accepts rid objects", () => {
		const result = recordId().safeParse({ rid: "internet:test" });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(getRecordIdTable(result.data)).toBe("internet");
			expect(result.data.id).toBe("test");
		}
	});

	test("accepts tb/id objects", () => {
		const result = recordId().safeParse({ tb: "internet", id: 9000 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(getRecordIdTable(result.data)).toBe("internet");
			expect(result.data.id).toBe(9000);
		}
	});

	test("rejects invalid table names", () => {
		const result = recordId().safeParse("123invalid:test");
		expect(result.success).toBe(false);
	});

	test("rejects values from the wrong table when constrained", () => {
		const result = recordId("internet").safeParse(
			createRecordId("users", "test"),
		);
		expect(result.success).toBe(false);
	});

	test("rejects rid objects from the wrong table when constrained", () => {
		const result = recordId("internet").safeParse({ rid: "users:test" });
		expect(result.success).toBe(false);
	});
});
