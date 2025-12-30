import { save } from "~/biz/btnews/save-mp.ts";
import type {S3Option} from "~/file/s3.ts";
import {createFileSaver} from "~/file";

const s3: S3Option = {
   provider: 's3',
   accessKeyId: process.env.S3_ACCESS_KEY_ID,
   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
   endpoint: process.env.S3_ENDPOINT,
   region: process.env.S3_REGION,
   bucket: process.env.S3_BUCKET,
   resourceURL: process.env.S3_RESOURCE_URL,
}
const localFS = { provider: 'local' } as const
const localSaver = createFileSaver(localFS)
export const s3Saver = createFileSaver(s3)
const savers = { imageSaver: s3Saver, markdownSaver: localSaver }
await save({ ...savers })
