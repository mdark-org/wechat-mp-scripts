import sharp from 'sharp'
import { f } from '~/shared/fetch.ts'
import { FileSaver } from '../file/index.ts'

export type ImageOption = { saver: FileSaver }

export type ImageItem = {
	count: number
	url: string
	path: string
	// item name without file extension
	name: string
	// file format
	format?: 'webp' | 'png' | 'jpeg' | 'jpg'
}

export type SaveImageFn = (img: ImageItem) => Promise<string>

async function fetchImageContent(url: string) {
	const resp = await f(url, { responseType: 'arrayBuffer' })
	return sharp(resp).webp({ quality: 80 })
}
