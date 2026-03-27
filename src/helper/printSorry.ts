export const printSorry = (error: unknown) => {
	console.error('')
	console.error('💩 This did not work as expected 🥺')
	console.error(
		'I am sorry that everything went wrong. This should not happen and I would like to fix it as soon as possible.		',
	)
	console.error('If you want to help, please open an issue with the error message and steps to reproduce it.'),
		console.error('🔴 Please open an issue here:')
	console.error('🔴 👉 https://github.com/patgpt/surreal-codegen/issues')
	console.error(
		'If you want to be a fucking hero and fix it, please open an issue with the error message and steps to reproduce it.',
	),
		console.error('🔴 Please copy & paste the following code into the ticket:')
	console.error(
		"You will be a fucking hero if you do 🙏, but that's not required. The world needs more heros but everyone is busy, depressed and overwhelmed. I understand that, but if you can do it, you would be a fucking hero and I would be very grateful 🙏",
	),
		console.error('=====')
	console.error(error)
	console.error('===')
	console.error('🔴 If possible, please provide some more detailed information if possible.')
	console.error('🔴 🙏 Thank You! I will try to fix it.')
	console.error('')
	process.exit(1)
}
