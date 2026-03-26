import { beforeEach, describe, expect, it, mock } from 'bun:test'

const getTableInfoMock = mock().mockResolvedValue({
	fields: { name: 'DEFINE FIELD name ON command TYPE string PERMISSIONS FULL' },
})

mock.module('../database/getTableInfo.js', () => ({
	getTableInfo: getTableInfoMock,
}))

describe('generateTableSchema', () => {
	beforeEach(() => {
		getTableInfoMock.mockClear()
		getTableInfoMock.mockResolvedValue({
			fields: { name: 'DEFINE FIELD name ON command TYPE string PERMISSIONS FULL' },
		})
	})

	it('generates a schema for a SCHEMAFULL table', async () => {
		const { generateSchemaForTable } = await import('./generateTableSchema.ts')
		const { inputFields, outputFields } = await generateSchemaForTable(
			'test',
			'DEFINE TABLE test TYPE ANY SCHEMAFULL PERMISSIONS NONE',
		)

		expect(inputFields).toBe('const testInputSchemaGen = z.object({\nname: z.string()\n})')

		expect(outputFields).toBe('const testOutputSchemaGen = z.object({\nname: z.string()\n})')
	})

	it('generates a schema for a SCHEMALESS table', async () => {
		const { generateSchemaForTable } = await import('./generateTableSchema.ts')
		const { inputFields, outputFields } = await generateSchemaForTable(
			'test',
			'DEFINE TABLE test TYPE ANY SCHEMALESS PERMISSIONS NONE',
		)

		expect(inputFields).toBe('const testInputSchemaGen = z.object({\nname: z.string()\n}).passthrough()')

		expect(outputFields).toBe('const testOutputSchemaGen = z.object({\nname: z.string()\n}).passthrough()')
	})

	it('generates a schema for a table without explicit SCHEMAFULL/SCHEMALESS setting', async () => {
		const { generateSchemaForTable } = await import('./generateTableSchema.ts')
		const { inputFields, outputFields } = await generateSchemaForTable(
			'test',
			'DEFINE TABLE test TYPE ANY PERMISSIONS NONE',
		)

		expect(inputFields).toBe('const testInputSchemaGen = z.object({\nname: z.string()\n}).passthrough()')

		expect(outputFields).toBe('const testOutputSchemaGen = z.object({\nname: z.string()\n}).passthrough()')
	})
})
