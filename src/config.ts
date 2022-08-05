const {
  NODE_ENV,
  STARDUST_APIKEY,
  TEMPLATE_ID,
} = process.env
const TEST = 'test'

export const nodeEnv = NODE_ENV
export const isTestEnv = nodeEnv === TEST
export const apikey = isTestEnv ? STARDUST_APIKEY as string : ''
export const template = {
  id: +(TEMPLATE_ID as string) || 0,
}

if (!template.id && nodeEnv === TEST) {
  console.warn('unable to run some tests without template id')
}
