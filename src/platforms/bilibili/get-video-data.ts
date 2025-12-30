import {f} from "~/shared/fetch.ts";
import {getVideoDetailSchema} from "~/platforms/bilibili/get-video-data.schema.ts";

export async function getVideoDescription(bv:string) {
  try {
    const res = await f(`https://api.bilibili.com/x/web-interface/view`, {
      query: { bvid: bv }
    })
    const detail = getVideoDetailSchema.decode(res)
    return detail.data.dynamic
  }catch(e) {
    return ""
  }
}