import { ResourceItem } from '~/platforms/wechat/html2md/extract-article.ts'
import getURLTitle from '~/utils/get-page-title.ts'
import { FileSaver } from '~/file/index.ts'
import { createImageSaver } from '~/image/index.ts'
import { getLogger } from '~/utils/logger.ts'

type SaveOption = {
	images: ResourceItem[]
	urls: ResourceItem[]
	getImageFilename: (item: ResourceItem) => string
	getImageBasepath: (item: ResourceItem) => string
	imageSaver: ReturnType<typeof createImageSaver>
	markdownSaver: FileSaver
	markdown: string
}
const logger = getLogger(import.meta.filename)
export const saveWechatMPArticle = async (
	opt: SaveOption,
) => {
	const images = opt.images
	const urls = opt.urls
	const urlProcessor = async (item: ResourceItem) => {
		const title = await getURLTitle(item.url)
			.catch((e) => {
				logger.error(e)
				logger.info(
					`failed to fetch url title: ${item.url}, use plain url as title`,
				)
				return item.url
			})
		return {
			text: `> [${title}](${item.url})`,
			...item,
		}
	}

	const imageProcessor = async (item: ResourceItem) => {
		const name = opt.getImageFilename(item)
		const basepath = opt.getImageBasepath(item)
		const text = await opt.imageSaver({
			name,
			count: item.count,
			path: basepath,
			format: 'webp',
			url: item.url,
		}).catch((e) => {
			logger.error(e)
			logger.info(`failed to save image: ${item.url}, use source url`)
			return item.url
		})
		return {
			text: `\n![${name ?? item.placeholder}](${text})\n`,
			...item,
		}
	}

	const processedResources = await Promise.all([
		...urls.map((it) => urlProcessor(it)),
		...images.map((it) => imageProcessor(it)),
	])

	let md = opt.markdown
	processedResources.forEach((item: ResourceItem & { text: string }) => {
		md = md.replace(item.placeholder, item.text)
	})
	return md
}
