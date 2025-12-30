import {f} from "~/shared/fetch.ts";

export const getPlainHtml = async (url: string) => {
  return f(url, { responseType: 'text' })
}