import { getArticleList } from '~/platforms/wechat/api/get-article-list.ts'
import { BTNEWS, save } from '~/biz/btnews/save-mp.ts'
import pLimit from 'p-limit'
import { FileSaver } from '../../../file/index.ts'
import { getLogger } from '~/utils/logger.ts'

type BatchOption = {
	savers: {
		imageSaver: FileSaver
		markdownSaver: FileSaver
	}
}

const logger = getLogger(import.meta.filename)

export async function batch(opt: BatchOption) {
	const articles = []
	let con = true
	let p = 1
	let beginMsgId = undefined
	while (con) {
		const data = await getArticleList({
			bizId: BTNEWS.WECHAT_MP_BIZ_ID,
			albumId: BTNEWS.WECHAT_MP_ALBUM_ID,
			count: 20,
			begin_msgid: beginMsgId,
			begin_itemidx: beginMsgId ? 1 : undefined,
		})
		if (data.length < 20) {
			con = false
		}
		logger.info(`page ${p++}`)
		logger.info(beginMsgId)
		beginMsgId = data.at(-1)?.msgId
		articles.push(...data)
	}
	const l = pLimit(15)

	const res = articles.map((it) =>
		l(async () => {
			try {
				const res = await save({
					url: it.url,
					...opt.savers,
					date: parseInt(it.date) * 1000,
				})
				logger.info(`save ${res.filepath}`)
			} catch (e) {
				logger.info(`failed to save ${it.url} ${it.title}`)
			}
		})
	)

	await Promise.all(res)
}
