import { AwsClient } from 'aws4fetch'
import { f } from '~/shared/fetch.ts'
import { Buffer } from 'node:buffer'

export type S3Option = {
	provider: 's3'
	bucket: string
	region?: string
	endpoint: string
	accessKeyId: string
	secretAccessKey: string
	resourceURL?: string
}

export const createS3FileSaver = (opt: S3Option) => {
	const client = new AwsClient({
		region: opt.region ?? 'auto',
		accessKeyId: opt.accessKeyId,
		secretAccessKey: opt.secretAccessKey,
	})
	return async (p: string, processed: string | Buffer) => {
		const key = `${opt.bucket}/${p}`
		const url = `${opt.endpoint}/${key}`
		const signedRequest = await client.sign(`${url}?X-Amz-Expires=${3600}`, {
			method: 'PUT',
			body: processed,
		})
		const result = await f.native(signedRequest)
		const resourceUrl = (opt.resourceURL ?? `${opt.endpoint}/${opt.bucket}`) +
			'/' + p
		return resourceUrl
	}
}
