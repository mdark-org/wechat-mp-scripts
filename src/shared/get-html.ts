import { f } from '~/shared/fetch.ts'

export const getPlainHtml = (url: string) => {
	return f(url, { responseType: 'text' })
}
