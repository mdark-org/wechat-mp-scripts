import { Buffer } from 'node:buffer'
import { f } from '~/shared/fetch.ts'

type GetContentOption = {
	repo: string
	path: string
	branch?: string
}
export async function getFileContent({ repo, branch, path }: GetContentOption) {
	const response = await f(`https://api.github.com/repos/${repo}/contents/${path}`, {
		query: {
			ref: branch,
		},
		// deno-lint-ignore ban-ts-comment
		// @ts-ignore
		headers: {
			'X-GitHub-Api-Version': '2022-11-28',
		},
	})
	const base64Content = response.content as string
	const bufferObject = Buffer.from(base64Content, 'base64')
	return bufferObject.toString('utf8')
}
