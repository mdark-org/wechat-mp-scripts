import { extractArticle } from '~/platforms/wechat/html2md/index.ts'
import { extractFrontMatter } from './front-matter.btnews.ts'
import { setActionOutput } from '~/utils/set-action-output.ts'
import { createImageSaver } from '~/image/index.ts'
import { indexToRange } from '~/utils/index-to-range.ts'
import { FileSaver } from '~/file/index.ts'
import { saveWechatMPArticle } from '~/platforms/wechat/html2md/save.ts'
import matter from 'gray-matter'
import {getLogger} from "~/utils/logger.ts";

export type Option = {
	title?: string
	date?: string | number
	bv?: string
	yt?: string
	url?: string
	imageSaver: FileSaver
	markdownSaver: FileSaver
}
export const BTNEWS = {
	WECHAT_MP_BIZ_ID: 'Mzk0MTIzNTc0NQ==',
	WECHAT_MP_ALBUM_ID: '3119370632720400390',
}

const logger = getLogger(import.meta.filename)

export const save = async (opt: Option) => {
	const { markdown, urls, images, title, publishedTime } = await extractArticle(
		opt.url ?? {
			bizId: BTNEWS.WECHAT_MP_BIZ_ID,
			albumId: BTNEWS.WECHAT_MP_ALBUM_ID,
		},
	)
	const imageSaver = createImageSaver({ saver: opt.imageSaver })

	const fm = await extractFrontMatter({
		title: opt.title ?? title,
		date: opt.date ?? publishedTime,
		bv: opt.bv,
		yt: opt.yt,
	})

	setActionOutput({
		branch: `${fm.category}-${fm.index}`,
		title: fm.title,
		date: fm.date,
		category: fm.category,
	})

	const getBasepath = (_: typeof fm, withIndex: boolean) => {
		let b = `btnews/${fm.category ?? 'unknown'}`
		if (fm.index) {
			b = b + `/${indexToRange(fm.index)}`
			if (withIndex) b += `/${fm.index}`
		} else {
			const year = fm.date.slice(0, 4)
			const month = fm.date.slice(5, 7)
			b = b + `/${year}/${month}`
			if (withIndex) b += `/${fm.date}`
		}
		return b
	}
	const filename = `${fm.category}_${fm.index ?? fm.date?.replaceAll('-', '')}`

	const basepath = getBasepath(fm, true)
	const filepath = `${getBasepath(fm, false)}/${filename}.md`

	let processedMarkdown = await saveWechatMPArticle({
		urls,
		images,
		getImageFilename: (item) => `${filename}_${item.count}`,
		getImageBasepath: () => basepath,
		imageSaver: imageSaver,
		markdownSaver: opt.markdownSaver,
		markdown: markdown,
	})

	processedMarkdown = processedMarkdown
		.replace('**点击下图观看视频**', '')
		.replace('点击下图观看视频', '')
	const md = matter.stringify(processedMarkdown, fm)

	await opt.markdownSaver(filepath, md)

	return {
		filepath,
		markdown: md,
	}
}
