import {BTNEWS, save} from "~/biz/btnews/save-mp.ts";
import {extractArticle} from "~/platforms/wechat";
import {extractFrontMatter} from "~/biz/btnews/front-matter.btnews.ts";
import {indexToRange} from "~/utils/index-to-range.ts";
import {f} from "~/shared/fetch.ts";
import matter from "gray-matter";
import {s3Saver} from "~/index.ts";
import {createGithubFileSaver} from "~/file/github.ts";


const {markdown, urls, images, title, publishedTime} = await extractArticle({
  bizId: BTNEWS.WECHAT_MP_BIZ_ID,
  albumId: BTNEWS.WECHAT_MP_ALBUM_ID,
})
const fm = await extractFrontMatter({
  title: title,
  date: publishedTime,
})

const ghSaver = createGithubFileSaver({
  provider: 'github',
  repo: 'mdark-org/btnews',
  branch: 'master',
  dir: 'docs',
  token: process.env.GITHUB_TOKEN
})

const getBasepath = (_: typeof fm, withIndex: boolean) => {
  let b = `btnews/${fm.category ?? 'unknown'}`
  if (fm.index) {
    b = b + `/${indexToRange(fm.index)}`
    if(withIndex) b+=`/${fm.index}`
  } else {
    const year = fm.date.slice(0, 4)
    const month = fm.date.slice(5, 7)
    b = b + `/${year}/${month}`
    if(withIndex) b+=`/${fm.date}`
  }
  return b
}
const filename = `${fm.category}_${fm.index ?? fm.date?.replaceAll('-', '')}`
const filepath = `${getBasepath(fm, false)}/${filename}.md`
const gh = "https://raw.githubusercontent.com/mdark-org/btnews/refs/heads/master/docs"
const url = gh + '/' + filepath
const resp = await f.native(url)
const ok = resp.ok
if(!ok) {
  console.log(`${resp.status} ignore: ${filepath}`)
}else {
  const text = await resp.text()
  const remoteMatter = matter(text)
  if(!remoteMatter.data['index']) {
    // not updated
    const {filepath, markdown} = await save({
      imageSaver: s3Saver,
      markdownSaver: (k, val: string) => {
        const localMatter = matter(val)
        const resMatter = Object.assign(remoteMatter.data, localMatter.data)
        const res = matter.stringify(localMatter.content, resMatter)
        return ghSaver(k, res)
      },
    })
  }
}