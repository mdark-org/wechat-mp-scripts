import pLimit, { type LimitFunction } from 'p-limit'
import {collectArticlesFromMPAlbum, MPAlbumCollectOption} from "~/platforms/wechat/get-mp-articles.ts";
import {ArticleItem} from "~/platforms/wechat/index.ts";

type BatchOption = {
  collector: MPAlbumCollectOption
  limiter?: LimitFunction | number,
  handler: (it: ArticleItem) => Promise<void>,
}

export async function batch(opt: BatchOption) {
  const articles = await collectArticlesFromMPAlbum(opt.collector)
  let l: LimitFunction
  if(opt.limiter) {
    if(typeof opt.limiter === 'number') l = pLimit(opt.limiter)
    else l = opt.limiter
  } else {
    l = pLimit(15)
  }
  await Promise.allSettled(articles.map((it) => l(() => opt.handler(it))))
}