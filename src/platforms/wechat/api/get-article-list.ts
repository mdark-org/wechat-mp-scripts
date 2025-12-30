import { f } from '~/shared/fetch.ts'
import { z } from 'zod'

const articleSchema = z.object({
	cover_img_1_1: z.string(),
	cover_theme_color: z.object({
		b: z.string(),
		g: z.string(),
		r: z.string(),
	}).optional(),
	create_time: z.string(),
	is_pay_subscribe: z.string(),
	is_read: z.string(),
	item_show_type: z.string(),
	itemidx: z.string(),
	key: z.string(),
	msgid: z.string(),
	pos_num: z.string(),
	title: z.string(),
	tts_is_ban: z.string(),
	url: z.string(),
	user_read_status: z.string(),
})

const baseInfoSchema = z.object({
	article_count: z.string().optional(),
	cover: z.string().optional(),
	cover_ban: z.string().optional(),
	description: z.string().optional(),
	fee: z.string().optional(),
	is_first_screen: z.string().optional(),
	is_numbered: z.string().optional(),
	is_paid: z.string().optional(),
	is_reverse: z.string().optional(),
	isupdating: z.string().optional(),
	needpay: z.string().optional(),
	nickname: z.string().optional(),
	public_tag_content_num: z.string().optional(),
	public_tag_link: z.string().optional(),
	read_count: z.string().optional(),
	share_brand_icon: z.string().optional(),
	subtype: z.string().optional(),
	title: z.string().optional(),
	type: z.string().optional(),
	update_frequence: z.object({ month: z.string() }).optional(),
	username: z.string().optional(),
})

const getArticleListSchema = z.object({
	getalbum_resp: z.object({
		article_list: z.union([articleSchema, articleSchema.array()]),
		base_info: baseInfoSchema,
	}),
})

type GetOption = {
	// bizId in url, @example: Mzk0MTIzNTc0NQ==
	bizId: string
	albumId: string
	// return article count, default 1
	count?: number
	begin_msgid?: string
	begin_itemidx?: number
}

/**
 * fetch latest ${cnt} articles data from wechat mp
 */
export const getArticleList = async (option: GetOption) => {
	const res = await f('https://mp.weixin.qq.com/mp/appmsgalbum', {
		query: {
			action: 'getalbum',
			__biz: option.bizId,
			album_id: option.albumId,
			count: option.count,
			begin_itemidx: option.begin_itemidx,
			begin_msgid: option.begin_msgid,
			f: 'json',
		},
	})

	const decoded = getArticleListSchema.safeDecode(res)
	if (!decoded.success) {
		throw decoded.error
	}
	const data = decoded.data
	if (Array.isArray(data.getalbum_resp.article_list)) {
		return data.getalbum_resp.article_list.map((it) => ({
			msgId: it.msgid,
			url: it.url,
			title: it.title,
			date: it.create_time,
			cover: it.cover_img_1_1,
		}))
	}
	const it = data.getalbum_resp.article_list
	return [{
		msgId: it.msgid,
		url: it.url,
		title: it.title,
		date: it.create_time,
		cover: it.cover_img_1_1,
	}]
}
