import dayjs from 'dayjs'
import { getLogger } from '~/utils/logger.ts'
import { getVideoDescription } from '~/platforms/bilibili/get-video-data.ts'
import {indexToRange} from "~/utils/index-to-range.ts";

type BtNewsOption = {
	bv?: string
	yt?: string
	title?: string
	date?: string | number
}

export interface BedtimeNewsFrontMatter {
	title: string
	date: string
	category?: string
	description: string
	tags: string[]
	index: string
	bvid?: string
	ytid?: string
	xgid?: string
}

const logger = getLogger(import.meta.filename)

export async function extractFrontMatter(
	option: BtNewsOption,
): Promise<BedtimeNewsFrontMatter> {
	const sourceTitle = option.title
	let date: null | string
	try {
		date = dayjs(option.date).format('YYYY-MM-DD')
	} catch (e) {
		logger.info(`无法提取日期，取当前日期`)
		date = dayjs().format('YYYY-MM-DD')
	}
	const titlePattern = /(睡前消息|讲点黑话|参考信息|高见)第?\d{1,4}(\.5)?期?文稿[:：]/
	const ans = titlePattern.exec(sourceTitle)
	if (ans == null && !option.title) {
		logger.info(option)
		logger.error(
			`标题格式错误:${sourceTitle}，无法匹配类型，取默认类型：other`,
		)
	}
	let title = sourceTitle?.replace(titlePattern, '')
	const categoryPattern = /(睡前消息|讲点黑话|参考信息|高见)/
	const category = categoryPattern.exec(sourceTitle)
		?.['0'] as keyof typeof categoryToPath

	const indexPattern = /\d{1,4}(\.5)?/
	let index = sourceTitle.match(indexPattern)?.['0']
	if (index == null) {
		index = '0'
		if (!option.title) {
			logger.error(`标题格式错误:${sourceTitle}，无法提取索引`)
		}
	}
	title = `【${category}${index}】${title.trim()}`
	const description = option.bv ? await getVideoDescription(option.bv) : ''
	return {
		title: title,
		date: date,
		category: categoryToPath[category] ?? 'other',
		description: description,
		tags: [],
		index: index.padStart(4, '0'),
		bvid: option.bv ?? '',
		ytid: option.yt ?? '',
	}
}

const categoryToPath = {
	'睡前消息': 'btnews',
	'讲点黑话': 'slang',
	'高见': 'opinion',
	'参考信息': 'refnews',
}



export const frontmatterToPath = (fm: BedtimeNewsFrontMatter) => {
	let basepath = `btnews/${fm.category ?? 'unknown'}`
	if (fm.index) {
		basepath += `/${indexToRange(fm.index)}`
	} else {
		const year = fm.date.slice(0, 4)
		const month = fm.date.slice(5, 7)
		basepath += `/${year}/${month}`
	}

	const filename = `${fm.category}_${fm.index ?? fm.date?.replaceAll('-', '_')}`
	let filepath = `docs/${basepath}/${filename}.md`

	// if (opt.path) {
	// 	filepath = opt.path
	// }
	return { filepath, basepath, filename }
}