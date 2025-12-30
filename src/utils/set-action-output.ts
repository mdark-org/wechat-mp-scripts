import * as ghac from "@actions/core";

type Value = string | number | boolean | null | undefined

type ActionFn = ((key: string | Record<string, Value>, value?: Value) => void)

const isGitHubActionEnv = process.env['GITHUB_ACTIONS'] === 'true'

export const setActionOutput: ActionFn = (key, value) => {
  if(!isGitHubActionEnv || key == undefined) return
  if(typeof key === "string") ghac.setOutput(key, value)
  if(typeof key === "object") {
    Object.keys(key).forEach(k => ghac.setOutput(k, key[k]))
  }
}