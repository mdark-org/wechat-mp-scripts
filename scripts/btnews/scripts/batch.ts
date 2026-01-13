
import {getLogger} from "~/utils/logger.ts";
import {BTNEWS, save} from "../save-mp.ts";
import pLimit from "p-limit";
import {ArticleItem} from "~/platforms/wechat/index.ts";
import {batch} from "~/platforms/wechat/batch.ts";
import {localSaver} from "~/index.ts";
const logger = getLogger(import.meta.filename)
const handleArticleItem = async (it: ArticleItem) => {
  try {
    const res = await save({
      url: it.url,
      date: it.date,
      imageSaver: localSaver,
      markdownSaver: localSaver
    })
    logger.info(`save ${res.filepath}`)
  } catch (e) {
    logger.info(`failed to save ${it.url} ${it.title}`)
  }
}

export const batchMPArticles = async (): Promise<void> => {
  await batch({
    collector: {
      bizId: BTNEWS.WECHAT_MP_BIZ_ID,
      albumId: BTNEWS.WECHAT_MP_ALBUM_ID,
      limit: 1,
    },
    handler: handleArticleItem,
    limiter: pLimit(15)
  })
}
