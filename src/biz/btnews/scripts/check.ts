import { BTNEWS, save } from '~/biz/btnews/save-mp.ts'
import { extractArticle } from '~/platforms/wechat/index.ts'
import { extractFrontMatter } from '~/biz/btnews/front-matter.btnews.ts'
import { indexToRange } from '~/utils/index-to-range.ts'
import matter from 'gray-matter'
import { createGithubFileSaver } from '~/file/github.ts'
import { getLogger } from '~/utils/logger.ts'
import process from 'node:process'
import { getFileContent } from '~/platforms/github/get-content.ts'
import { CMDOptions } from '~/biz/btnews/scripts/type.ts'
import { s3Saver } from '~/index.ts'
import * as fs from "node:fs";
import {isDebugging} from "~/utils/set-action-output.ts";
const WECHAT_MP_KEY = 'wx_mp'
const ghSaver = createGithubFileSaver({
	provider: 'github',
	repo: 'mdark-org/btnews',
	branch: 'master',
	dir: 'docs',
	token: process.env.GITHUB_TOKEN,
})

const logger = getLogger(import.meta.filename)

export async function checkExistAndTrySyncWithSource(opt: CMDOptions) {
	const { markdown, urls, images, cheerioAPI: $, html, date } = await extractArticle(
		opt.url ?? {
			bizId: BTNEWS.WECHAT_MP_BIZ_ID,
			albumId: BTNEWS.WECHAT_MP_ALBUM_ID,
		},
	)
	const url = $('meta[property="og:url"]').attr()?.['content'] || opt.url

	const title = $('#activity-name').text().trim()
		|| $('meta[property="og:title"]').attr()?.['content']?.trim()
		|| $('meta[property="twitter:title"]').attr()?.['content']?.trim()
		|| undefined
	if(isDebugging()) {
		fs.writeFileSync('source.html', html)
		logger.info(`Checking title: ${$('#activity-name').text().trim()}`)
		logger.info(`Checking og:title: ${$('meta[property="og:title"]').attr()?.['content']?.trim()}`)
		logger.info(`Checking twitter:title: ${$('meta[property="twitter:title"]').attr()?.['content']?.trim()}`)
		logger.info(`input title: ${opt.title}`)
		logger.info(`title: ${title}`)
	}

	const publishedTime = $('#publish_time').text().trim() || date
	const fm = await extractFrontMatter({
		title: opt?.title ?? title,
		date: publishedTime,
		bv: opt.bv,
		yt: opt.yt,
	})

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

	if (opt.path) {
		filepath = opt.path
	}
	const text = await getFileContent({
		repo: 'mdark-org/btnews',
		branch: 'master',
		path: filepath,
	})
	const remoteMatter = matter(text)
	if (remoteMatter.data[WECHAT_MP_KEY] && opt.overwrite !== 'true') {
		logger.info(`skip update: already updated, ${filepath}`)
		return
	}
	await save({
		bv: opt.bv,
		yt: opt.yt,
		imageSaver: s3Saver,
		markdownSaver: (k, val: string) => {
			const localMatter = matter(val)
			const remote = removeEmptyKeys(remoteMatter.data)
			const resMatter = Object.assign(remote, localMatter.data)
			resMatter[WECHAT_MP_KEY] = true
			const res = matter.stringify(localMatter.content, resMatter)
			return ghSaver(k, res)
		},
	})
	logger.info(`successfully update ${filepath}`)
}

function removeEmptyKeys(obj) {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => {
			return value !== null && value !== undefined && value !== ''
		}),
	)
}
