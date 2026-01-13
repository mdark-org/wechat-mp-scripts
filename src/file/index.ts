import { createS3FileSaver, S3Option } from '~/file/s3.ts'
import { saveToFS } from '~/file/local-fs.ts'
import { Buffer } from 'node:buffer'

export type FileSaver = (key: string, val: string | Buffer) => Promise<string>

export type FileSaverOption =
	| { provider: 'local' }
	| { provider: 'noop' }
	| ({ provider: 's3' } & S3Option)

export const createFileSaver = (opt: FileSaverOption) => {
	switch (opt.provider) {
		case 'noop': return () => Promise.resolve("NOOP")
		case 'local':
			return saveToFS
		case 's3':
			return createS3FileSaver(opt)
	}
}
