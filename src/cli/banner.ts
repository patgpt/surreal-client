import boxen from 'boxen'
import chalk from 'chalk'
import figlet from 'figlet'
import gradient from 'gradient-string'

// Cyberpunk palette: electric cyan → hot magenta → matrix green
const cyber = gradient(['#00f5ff', '#bf00ff', '#00ff41'])

export function renderBanner(version: string): void {
	const title = figlet.textSync('SURREAL', {
		font: 'ANSI Shadow',
		horizontalLayout: 'default',
	})

	const sub = figlet.textSync('codegen', {
		font: 'Small',
		horizontalLayout: 'default',
	})

	console.log(cyber.multiline(title))
	console.log(chalk.hex('#bf00ff')(sub))
	console.log()

	const info = [
		`${chalk.cyan('◆')} SurrealDB TypeScript Client Generator`,
		`${chalk.hex('#bf00ff')('▸')} Zod schemas + typed repositories, auto-generated`,
		`${chalk.hex('#00ff41')('◈')} v${version}  ${chalk.dim('[ CYBERPUNK EDITION ]')}`,
	].join('\n')

	console.log(
		boxen(info, {
			padding: { top: 0, bottom: 0, left: 2, right: 2 },
			margin: { top: 0, bottom: 1, left: 0, right: 0 },
			borderStyle: 'round',
			borderColor: 'cyan',
			dimBorder: false,
		}),
	)
}

export function neonLine(char = '─', width = 60): string {
	return chalk.hex('#00f5ff')(char.repeat(width))
}

export const label = {
	success: chalk.bgHex('#00ff41').hex('#000000').bold(' ✓ '),
	error: chalk.bgHex('#ff003c').hex('#ffffff').bold(' ✗ '),
	warn: chalk.bgHex('#ffb700').hex('#000000').bold(' ⚠ '),
	info: chalk.bgHex('#00f5ff').hex('#000000').bold(' ◆ '),
	run: chalk.bgHex('#bf00ff').hex('#ffffff').bold(' ▶ '),
}
