import { save } from '../save-mp.ts'
import matter from 'gray-matter'
import { createGithubFileSaver } from '~/file/github.ts'
import { getLogger } from '~/utils/logger.ts'
import process from 'node:process'
import { getFileContent } from '~/platforms/github/get-content.ts'
import { CMDOptions } from './type.ts'
import { s3Saver } from '~/index.ts'
import {createFileSaver} from "~/file/index.ts";
const WECHAT_MP_KEY = 'wx_mp'
const ghSaver = createGithubFileSaver({
	provider: 'github',
	repo: 'mdark-org/btnews',
	branch: 'master',
	dir: 'docs',
	token: process.env.GITHUB_TOKEN,
})

const logger = getLogger(import.meta.filename)

const noopSaver = createFileSaver({provider: 'noop' })

export async function checkExistAndTrySyncWithSource(opt: CMDOptions) {
	const { filepath } = await save({
		bv: opt.bv,
		yt: opt.yt,
		imageSaver: noopSaver,
		markdownSaver: noopSaver,
	})

	const text = await getFileContent({
		repo: 'mdark-org/btnews',
		branch: 'master',
		path: `docs/${filepath}`,
	})

	const remoteMatter = matter(text)
	if (remoteMatter.data[WECHAT_MP_KEY] && opt.overwrite !== 'true') {
		logger.info(`skip update: already updated, ${filepath}`)
		return
	}

	const postprocessContent = (val) => {
		const localMatter = matter(val)
		const remote = removeEmptyKeys(remoteMatter.data)
		const resMatter = Object.assign(localMatter.data, remote)
		resMatter[WECHAT_MP_KEY] = true
		return matter.stringify(localMatter.content, resMatter)
	}

	await save({
		bv: opt.bv,
		yt: opt.yt,
		imageSaver: s3Saver,
		markdownSaver: (k,v) => ghSaver(k, postprocessContent(v)),
	})
	logger.info(`successfully update ${filepath}`)
}


function removeEmptyKeys(obj) {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => {
			return value !== null && value !== undefined && value !== ''
		}),
	)
}
