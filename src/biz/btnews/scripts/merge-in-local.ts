import {glob} from "glob";
import {f} from "~/shared/fetch.ts";
import matter from "gray-matter";
import * as fsp from "node:fs/promises";
import pLimit from "p-limit";
import * as fs from "node:fs";
import path from "node:path";


const gh = "https://raw.githubusercontent.com/mdark-org/btnews/refs/heads/master/docs"

async function mergeLLMGenContentAndSourceDoc() {
  const files = await glob("btnews/btnews/**/*.md")
  const limit = pLimit(20)
  const all = files.map((it) => limit(() => handlerItem(it).catch(e => {
    console.log(`failed to merge ${it}`)
  })))
  await Promise.all(all)
}

async function handlerItem(file: string) {
  const url = gh + '/' + file
  const resp = await f.native(url)
  const ok = resp.ok
  if(!ok) {
    console.log(`${resp.status} ignore: ${file}`)
    return
  }

  const text = await resp.text()
  const remoteMatter = matter(text)
  const local = await fsp.readFile(file, "utf8")
  const localMatter = matter(local)

  const resMatter = Object.assign(remoteMatter.data, localMatter.data)

  const content = localMatter.content
    .replace("**点击下图观看视频**", "")
    .replace("点击下图观看视频", "")
  const res = matter.stringify(content, resMatter)
  const p = path.join('updated', path.dirname(file))
  if(!fs.existsSync(p)) {
    fs.mkdirSync(p, {recursive: true})
  }
  await fsp.writeFile(`updated/${file}`, res)
}