import { pino } from 'pino'

const logger = pino()

export const getLogger = (name: string) => {
	return logger.child({ name })
}
