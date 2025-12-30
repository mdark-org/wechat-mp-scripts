import { GetArticleOptions, getMpArticleFromAlbum, getMPArticleHTML } from '../api/fetch-article.ts'
import { wechatMPHtml2md } from './index.ts'
import { getPlainHtml } from '~/shared/get-html.ts'
import dayjs from 'dayjs'
import {getLogger} from "~/utils/logger.ts";

export type ResourceItem = {
	count: number
	placeholder: string
	url: string
}

const logger = getLogger(import.meta.filename)

export async function extractArticle(opt: GetArticleOptions) {
	let html: string
	let date: string | undefined = undefined
	if (typeof opt === 'string') {
		html = await getPlainHtml(opt)
	} else {
		const albumArticle = await getMpArticleFromAlbum(opt)
		html = albumArticle.html
		try {
			date = dayjs(parseInt(albumArticle.date) * 1000).format('YYYY-MM-DD')
		} catch (e) {
			//   ignore data format
		}
	}
	const urls = [] as ResourceItem[]
	const images = [] as ResourceItem[]
	const onUrl = (s: string) => {
		const count = urls.length + 1
		const placeholder = `__LINK_PLACEHOLDER_${count}__`
		urls.push({
			count,
			placeholder: `__LINK_PLACEHOLDER_${count}__`,
			url: s,
		})
		return placeholder
	}

	const onImage = (s: string) => {
		const count = images.length + 1
		const placeholder = `__IMAGE_PLACEHOLDER_${count}__`
		images.push({
			count,
			placeholder: `__IMAGE_PLACEHOLDER_${count}__`,
			url: s,
		})
		return placeholder
	}

	const { md, $ } = await wechatMPHtml2md(html, { onUrl, onImage })

	const url = $('meta[property="og:url"]').attr()?.['content'] || typeof opt === "string" && opt

	const title = $('#activity-name').text().trim()
		|| $('meta[property="og:title"]').attr()?.['content']?.trim()
		|| $('meta[property="twitter:title"]').attr()?.['content']?.trim()
		|| undefined

	const publishedTime = $('#publish_time').text().trim() || date

	const metadata = {
		url,
		title,
		publishedTime
	}


	return {
		html,
		markdown: md,
		cheerioAPI: $,
		urls,
		images,
		metadata
	}
}
