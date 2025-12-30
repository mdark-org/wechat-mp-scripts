import { ofetch } from 'ofetch'

export const f = ofetch.create({
	headers: {
		'User-Agent':
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
	},
})
