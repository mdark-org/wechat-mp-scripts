import {getPlainHtml} from "~/shared/get-html.ts";
import {getArticleList} from "./get-article-list.ts";

export type Option = {
  bizId: string,
  albumId: string
}

export async function getMpArticleFromAlbum(options:Option) {
  const res = await getArticleList({
    ...options,
    count: 1
  })
  const latest = res[0]
  return {
    html: await getPlainHtml(latest.url),
    ...latest
  }
}


export type GetArticleOptions = string | Option

export async function getMPArticleHTML(opt: GetArticleOptions) {
  if(typeof opt === 'string') return await getPlainHtml(opt)
  const res = await getMpArticleFromAlbum(opt)
  return res.html
}