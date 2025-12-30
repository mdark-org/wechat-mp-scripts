import dayjs from "dayjs";
import {getLogger} from "~/utils/logger.ts";
import {getVideoDescription} from "~/platforms/bilibili/get-video-data.ts";
import {BedtimeNewsFrontmatter} from "./type";

type BtNewsOption = {
  bv?: string
  yt?: string
  title?: string
  date?: string | number
}

export async function extractFrontMatter(option:BtNewsOption):Promise<BedtimeNewsFrontmatter>{
  const logger = getLogger()
  const sourceTitle = option.title
  let date:null|string
  try {
    date = dayjs(option.date).format('YYYY-MM-DD')
  } catch (e) {
    logger.info(`无法提取日期，取当前日期`)
    date = dayjs().format('YYYY-MM-DD')
  }
  let titlePattern = /(睡前消息|讲点黑话|参考信息|高见)第?\d{1,4}(\.5)?期?文稿[:：]/
  let ans = titlePattern.exec(sourceTitle)
  if(ans == null && !option.title){
    console.log(option)
    logger.error(`标题格式错误:${sourceTitle}，无法匹配类型，取默认类型：other`)
  }
  let title = sourceTitle.replace(titlePattern,"")
  let catagoryPattern = /(睡前消息|讲点黑话|参考信息|高见)/
  let catagory = catagoryPattern.exec(sourceTitle)?.["0"] as keyof typeof categoryToPath

  let indexPattern = /\d{1,4}(\.5)?/
  let index = sourceTitle.match(indexPattern)?.["0"]
  if (index == null) {
    index = null
    if (!option.title) logger.error(`标题格式错误:${sourceTitle}，无法提取索引`)
  }
  title = `【${catagory}${index}】${title.trim()}`
  const description = option.bv ? await getVideoDescription(option.bv) : ""
  return {
    title: title,
    date: date,
    category: categoryToPath[catagory] ?? "other",
    description: description,
    tags: [],
    index: index.padStart(4, '0'),
    bvid: option.bv??"",
    ytid: option.yt??"",
  }
}


const categoryToPath = {
  "睡前消息":"btnews",
  "讲点黑话":"slang",
  "高见":"opinion",
  "参考信息":"refnews",
}