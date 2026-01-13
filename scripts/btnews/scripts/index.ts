import { parseArgs } from '@std/cli/parse-args'
import { checkExistAndTrySyncWithSource } from './check.ts'

const res = parseArgs(Deno.args)
const { task, ...options } = res
switch (task) {
	case 'try-sync-latest-mp-content':
		// deno-lint-ignore no-explicit-any
		await checkExistAndTrySyncWithSource(options as any); break
}
