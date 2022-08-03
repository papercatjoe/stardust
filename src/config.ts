export const nodeEnv = process.env.NODE_ENV
export const isTestEnv = nodeEnv === 'test'
export const apikey = isTestEnv ? process.env.STARDUST_APIKEY as string : ''
