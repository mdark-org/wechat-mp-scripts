// deno-lint-ignore-file
import * as cheerio from 'cheerio'

type Option = {
	onUrl: (url: string) => Promise<string> | string
	onImage: (elem: string, count?: number) => Promise<string> | string
}

const linkPattern =
	/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi

let imgCnt = 1

export const extractItem = async (
	option: Option,
	elem: any,
): Promise<string> => {
	let ans = ''
	if (elem?.data) {
		// 链接，先访问内容获取标题
		if (linkPattern.test(elem.data)) {
			return await option.onUrl(elem.data)
		}
		return elem.data
	}
	switch (elem.name) {
		case 'br':
			return '\n\n'
		case 'strong':
			const a = cheerio.load(elem.children)
			const t = a.text()
			if (t == '') {
				for (let item of elem.children) {
					ans += await extractItem(option, item)
				}
			} else {
				return `**${t}**`
			}
			return ans
		case 'p':
		case 'section':
			for (let item of elem.children) {
				ans += await extractItem(option, item)
			}
			return ans
		case 'img':
			imgCnt++
			const url = elem.attribs['data-src'] ?? elem.attribs['src'] ?? ''
			const img = await option.onImage(url, imgCnt)
			ans += `\n${img}\n`
			return ans
		case 'span':
			for (let item of elem.children) {
				ans += await extractItem(option, item)
			}
			return ans
		case 'h3':
			ans += '###'
		case 'h2':
			ans += '##'
		case 'h1':
			ans += '# ' + await extractItem(option, elem.children) + '\n'
			return ans
		case 'table':
			let text = '\n\n'
			for (let item of elem.children) {
				text += await extractItem(option, item)
			}
			return text
		case 'tbody':
			let body = ''
			const w = elem.children[0].children.length
			body += `${await extractItem(option, elem.children[0])}\n`
			body += '|' + Array(w).fill('---').join('|') + '|\n'
			for (const item of elem.children.slice(1)) {
				body += await extractItem(option, item) + '\n'
			}
			return body
		case 'tr':
			ans = '|'
			for (const item of elem.children) {
				ans += `${await extractItem(option, item)} |`
			}
			return ans
		case 'td':
			ans += cheerio.load(elem.children).text()
			return ans
	}
	return ans
}
