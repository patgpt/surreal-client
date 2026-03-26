export const printSorry = (error: unknown) => {
	console.error("");
	console.error("🔴 This did not work as expected 🥺");
	console.error(
		"🔴 I am sorry that this happened, and I kindly ask for your help to fix this.",
	);
	console.error("🔴");
	console.error("🔴 Please open an issue here:");
	console.error(
		"🔴 👉 https://github.com/sebastianwessel/surrealdb-client-generator/issues",
	);
	console.error("🔴");
	console.error("🔴 Please copy & paste the following code into the ticket:");
	console.error("=====");
	console.error(error);
	console.error("===");
	console.error(
		"🔴 If possible, please provide some more detailed information if possible.",
	);
	console.error("🔴 🙏 Thank You! I will try to fix it.");
	console.error("");
	process.exit(1);
};
