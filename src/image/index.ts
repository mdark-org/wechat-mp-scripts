import { ImageItem, ImageOption } from '~/image/type.ts'
import path from 'node:path'
import { f } from '~/shared/fetch.ts'
import sharp from 'sharp'

export const createImageSaver = (opt: ImageOption) => {
	return async (item: ImageItem) => {
		const format = item.format || 'webp'
		const filename = `${item.name}.${format}` || `${item.count}.${format}`
		const targetPath = item.path
		const p = path.join(targetPath, filename)
		const buf = await f(item.url, { responseType: 'arrayBuffer' })
		const processed = await sharp(buf).webp({ quality: 80 }).toBuffer()
		return await opt.saver(p, processed)
	}
}
