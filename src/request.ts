import * as urlJoin from 'url-join'
import * as querystring from 'querystring'
import * as axios from 'axios'
import _ from 'lodash'

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

export const shouldUseParams: Record<Method, boolean> = {
  get: true,
  post: false,
  put: false,
  delete: true,
}

export const methodBasedDefaultHeaders: Record<Method, Record<string, string>> = {
  get: getHeaders,
  post: postHeaders,
  delete: getHeaders,
  put: postHeaders,
}

export const paramsSerializer = (params: Record<string, any>) => {
  return _(params).keys().map((key) => (
    [key, _.isObject(params[key])
      ? encodeURIComponent(JSON.stringify(params[key]))
      : params[key]].join('=')
  )).value().join('&')
}

export const request = <T>(
  apikey: string | undefined,
  method: Method,
  url: string,
  body: object,
  options: Partial<axios.AxiosRequestConfig>,
) => {
  const methodDefaultHeaders = methodBasedDefaultHeaders[method]
  const useParams = shouldUseParams[method]
  return axios.default.request<T>({
    ...options,
    headers: {
      ...(apikey ? {
        'x-api-key': apikey as string,
      } : {}),
      ...methodDefaultHeaders,
      ...(options?.headers || {}),
    },
    ...(useParams ? { params: body, paramsSerializer } : { data: body }),
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
    urlJoin.default('https://core-api.stardust.gg/v1/', uri),
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
    urlJoin.default('https://marketplace-api.stardust.gg/v1/', uri),
    body,
    options,
  )
)
