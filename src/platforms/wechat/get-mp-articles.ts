import {getArticleList} from "~/platforms/wechat/api/get-article-list.ts";
import {getLogger} from "~/utils/logger.ts";

type Range = {
  begin?: {
    msgId?: string,
  },
  end?: {
    msgId?: string,
  }
}

export type MPAlbumCollectOption = {
  bizId: string,
  albumId: string,
  limit?: number,
  range?: Range,
}

const logger = getLogger(import.meta.filename)

export async function collectArticlesFromMPAlbum(opt: MPAlbumCollectOption) {
  let articles = [] as Awaited<ReturnType<typeof getArticleList>>
  let beginMsgId = opt.range?.begin?.msgId
  while (true) {
    const data = await getArticleList({
      bizId: opt.bizId,
      albumId: opt.albumId,
      count: 20,
      begin_msgid: beginMsgId,
      begin_itemidx: beginMsgId ? 1 : undefined,
    })
    const endIdx = data.findIndex(it => it.msgId === opt.range?.end?.msgId)
    if(endIdx !== -1) {
      articles.push(...data.slice(0, endIdx + 1))
      logger.debug(`find end article, total: ${articles.length}`)
      break
    } else {
      beginMsgId = data.at(-1)?.msgId
      articles.push(...data)
    }
    if(articles.length >= opt.limit) {
      articles = articles.slice(0, opt.limit)
      logger.debug(`reach size limit, total: ${articles.length}`)
      break
    }

    if (data.length < 20) {
      logger.debug(`no more articles found, total: ${articles.length}`)
      break
    }
  }
  return articles
}