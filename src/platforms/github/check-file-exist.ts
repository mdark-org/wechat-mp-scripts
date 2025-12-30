import {f} from "~/shared/fetch.ts";

type CheckOption = {
  repo: string,
  branch: string,
  // example: docs/example.md
  path: string
}

export const checkFileExist = async (opt: CheckOption) => {
  let repoRawContentBase = `https://raw.githubusercontent.com/${opt.repo}/${opt.branch}`
  let outputUrl = `${repoRawContentBase}/${opt.path}`
  let response = await f.raw(outputUrl)
  return response.status === 200
}