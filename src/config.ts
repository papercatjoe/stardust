export const apikey = process.env.NODE_ENV === 'test' ? process.env.STARDUST_APIKEY as string : ''

export const gameId = 984