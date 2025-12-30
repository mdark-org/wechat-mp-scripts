import * as cheerio from 'cheerio'
import { extractItem } from './extract-item.ts'

type Option = {
	onUrl: (url: string) => Promise<string> | string
	onImage: (elem: string, count?: number) => Promise<string> | string
}

export async function wechatMPHtml2md(html: string, option: Option) {
	const $ = cheerio.load(html)
	const content = $('#js_content')
	const children = content.children()
	let mdContent = ''
	for (const child of children) {
		mdContent += await extractItem(option, child)
	}
	return { md: mdContent, $ }
}

export { extractArticle } from './extract-article.ts'
