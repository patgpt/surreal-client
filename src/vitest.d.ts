// Custom matcher type augmentation for bun:test
import 'bun:test'

interface CustomMatchers<R = unknown> {
	toEqualIgnoringWhitespace(expected: string): R
}

declare module 'bun:test' {
	// biome-ignore lint/suspicious/noExplicitAny: required for matcher augmentation
	interface Matchers<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchers extends CustomMatchers {}
}
