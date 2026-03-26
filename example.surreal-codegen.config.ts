import path from "path"


// I want to not use a .json to configure when we can create a function that will accept config values and generate a configuration object. This way we can also have default values and type checking for the configuration and we can also use it programmatically if needed and from the CLI 

// Tell what its for... 
type CodegenConfig = {
	schemaFile?: string
	surreal?: string | URL | undefined | "ws://localhost:8000/rpc"
	username?: string | "root"
	password?: string | "root"
	ns?: string | "main"
	db?: string | "main"
	outputFolder?: string | "./out"
	generateClient?: boolean | true
}
const config: CodegenConfig = {

	// If you want to use a schema file instead of connecting to a database, specify the path to the schema file here. The schema file should be in .surql format and contain the definitions of your database schema. If this option is provided, the code generator will use the schema file to generate the client code instead of connecting to a SurrealDB instance.
	schemaFile: undefined,

	// Otherwise, if you want to connect to a SurrealDB instance to fetch the schema, specify the connection details here. The code generator will connect to the SurrealDB instance using these details, fetch the schema, and generate the client code based on that schema.
	surreal:  process.env.SURREALDB_URL || "http://localhost:8000/rpc",

	// The username and password for authenticating with the SurrealDB instance. These credentials will be used to sign in to the database and fetch the schema. Make sure to provide valid credentials that have access to the database you want to connect to.
	username: process.env.SURREALDB_USERNAME || "root",
	password: process.env.SURREALDB_PASSWORD || "root",


	// OPTIONAL: The namespace and database to use when connecting to the SurrealDB instance. If not provided, the code generator will use the default namespace and database. You can specify these if your schema is organized under a specific namespace or database in SurrealDB.
	ns:  process.env.SURREALDB_NAMESPACE || "main",
	db:  process.env.SURREALDB_DATABASE || "main",

	// Where to output the generated client code. This should be a path to a directory where you want the generated TypeScript files to be saved. If not provided, the code generator will use a default output folder named "out" in the current working directory. Make sure to specify a valid path where you have write permissions, as the code generator will create the necessary directories and files in that location.
	outputFolder: "./out",

	// Do you want to generate the client code? If set to true, the code generator will generate TypeScript client code based on the provided schema or connected SurrealDB instance. If set to false, the code generator will only fetch the schema and output it without generating any client code. This option can be useful if you only want to inspect the schema or use it for other purposes without generating a client.
	generateClient: true
} as const

const configure = (newConfig: Partial<CodegenConfig>) => {
	Object.assign(config, newConfig)
}
const c = configure({
	db: "testdb",
	generateClient: true,
	ns: "testns",
	surreal: "http://localhost:8000/rpc",
	username: "admin",
	password: "admin",
	schemaFile: undefined,
	outputFolder: "./client_generated"
})

const createTemp = () => {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'surreal-codegen-'))
	return tempDir
}

export { createTemp }


export const codegen = { configure , config }


 

