import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as fs from "node:fs";
type Option = {
  key: string,
  val: string | ArrayBuffer | Buffer,
}
export const saveToFS = async (key: string, val: string |  Buffer) => {
  const dir = path.dirname(key)
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  await fsp.writeFile(key, val)
  return key
}