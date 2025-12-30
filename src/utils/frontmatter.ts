type V = string | boolean | number | undefined | null
type Frontmatter = Record<string, V | V[]>

export function formatFrontMatter(fm: Frontmatter) {
	let res = `---\n`
	for (const item in fm) {
		if (fm[item] == undefined) continue
		if (Array.isArray(fm[item])) {
			const items = fm[item].filter((it) => it == undefined)
			if (items.length === 0) continue
			res += `${item}:\n`
			for (const it of fm[item]) {
				if (typeof it === 'string' && !it.trim()) continue
				res += `  - ${it}\n`
			}
		}
		if (typeof fm[item] === 'string') {
			if (!fm[item].trim()) continue
			if (fm[item].includes('\n')) {
				res += `${item}: |\n  ${fm[item]}\n`
			} else {
				res += `${item}: ${fm[item]}\n`
			}
		} else {
			res += `${item}: ${fm[item]}\n`
		}
	}
	res += `\n---\n`
	return res
}
