import { f } from '~/shared/fetch.ts'

type CheckOption = {
	repo: string
	branch: string
	// example: docs/example.md
	path: string
}

export const checkFileExist = async (opt: CheckOption) => {
	const repoRawContentBase = `https://raw.githubusercontent.com/${opt.repo}/${opt.branch}`
	const outputUrl = `${repoRawContentBase}/${opt.path}`
	const response = await f.raw(outputUrl)
	return response.status === 200
}
