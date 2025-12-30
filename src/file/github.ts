import {createSingleFileCommit} from "~/platforms/github/create-single-file-commit.ts";

export type GitHubOption = {
  provider: 'github'
  repo: string,
  branch: string
  dir: string,
  token: string
}
import path from "node:path";

export const createGithubFileSaver = (opt: GitHubOption) => {
  return async (p: string, processed: string | Buffer) => {
    const filepath = path.join(opt.dir, p)
    const name = path.basename(filepath)
    await createSingleFileCommit({
      msg: `update ${name} \n > commit via from api`,
      filename: filepath,
      content: processed,
      branch: opt.branch,
      repo: opt.repo,
      token: opt.token
    })
    return path.join(opt.repo, opt.branch, opt.dir, p);
  }
}