import * as cheerio from "cheerio";
import {f} from "~/shared/fetch.ts";

export default async function getURLTitle(url:string, retries = 3) {
  try {
    const text = await f(url, { retry: retries, responseType: 'text' });
    // charset 会导致部分网页标题解析乱码.,例如 http://news.sohu.com/20081105/n260444580.shtml
    // 部分网站存在反爬机制，部分情况下，会被屏蔽,比如百度百家号 :-(
    const $ = cheerio.load(text);
    return $('title').text();
  } catch (error) {
    return "";
  }
}