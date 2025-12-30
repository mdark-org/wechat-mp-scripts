import {GetArticleOptions, getMpArticleFromAlbum, getMPArticleHTML} from "../api/fetch-article.ts";
import {wechatMPHtml2md} from "./index.ts";
import {getPlainHtml} from "~/shared/get-html.ts";
import dayjs from "dayjs";

export type ResourceItem = {
  count: number,
  placeholder: string,
  url: string,
}
export async function extractArticle(opt: GetArticleOptions) {
  let html: string
  let date: string
  if(typeof opt === 'string') {
    html = await getPlainHtml(opt)
  }else {
    const albumArticle = await getMpArticleFromAlbum(opt)
    html = albumArticle.html
    try {
      date = dayjs(parseInt(albumArticle.date) * 1000).format("YYYY-MM-DD")
    }catch (e) {
      
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
      url: s
    })
    return placeholder
  }

  const onImage = (s: string) => {
    const count = images.length + 1
    const placeholder = `__IMAGE_PLACEHOLDER_${count}__`
    images.push({
      count,
      placeholder: `__IMAGE_PLACEHOLDER_${count}__`,
      url: s
    })
    return placeholder
  }

  const { md, $ } = await wechatMPHtml2md(html, { onUrl, onImage })
  const title = $("#activity-name").text().trim() || undefined
  const publishedTime = $("#publish_time").text().trim() || date
  return {
    markdown: md,
    cheerioAPI: $,
    urls,
    images,
    title,
    publishedTime
  }
}