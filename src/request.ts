import urlJoin from 'url-join'
import * as axios from 'axios'

export type Method = 'get' | 'post' | 'delete' | 'put'

export const applicationJson = 'application/json'
export const contentType = 'content-type'
export const accept = 'accept'

export const getHeaders = {
  [accept]: applicationJson,
}

export const postHeaders = {
  [accept]: applicationJson,
  [contentType]: applicationJson,
}

export const methodBasedDefaultHeaders: Record<Method, Record<string, string>> = {
  get: getHeaders,
  post: postHeaders,
  delete: postHeaders,
  put: postHeaders,
}

export const request = <T>(
  apikey: string | undefined,
  method: Method,
  url: string,
  body: object,
  options: Partial<axios.AxiosRequestConfig>,
) => {
  const methodDefaultHeaders = methodBasedDefaultHeaders[method]
  return axios.default.request<T>({
    ...options,
    headers: {
      'x-api-key': apikey as string,
      ...methodDefaultHeaders,
      ...(options?.headers || {}),
    },
    data: body,
    method: method.toUpperCase(),
    url,
  })
}

export const core = async <T>(
  apikey: string | undefined,
  method: Method,
  uri: string,
  body = {},
  options = {},
) => (
  request<T>(
    apikey,
    method,
    urlJoin('https://core-api.stardust.gg/v1/', uri),
    body,
    options,
  )
)

export const marketplace = async <T>(
  apikey: string | undefined,
  method: Method,
  uri: string,
  body = {},
  options = {},
) => (
  request<T>(
    apikey,
    method,
    urlJoin('https://marketplace-api.stardust.gg/v1/', uri),
    body,
    options,
  )
)
