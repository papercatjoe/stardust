import * as ethers from 'ethers'

import * as request from './request'
import type { Fee, AnyRecord } from './type'

export const defaultCap = ethers.BigNumber.from(2).pow(95)

export type TemplateType = 'FT' | 'NFT'

export type TemplateInstance = {
  gameId: number;
  cap: string;
  name: string;
  type: TemplateType;
  props: {
    mutable: AnyRecord;
    immutable: AnyRecord;
  };
  id: number;
  totalSupply: string;
  royalty: number;
  fees: Fee[];
  image: string;
}

export type CreateTemplate = {
  name: string;
  cap: string;
  type: TemplateType;
  props: AnyRecord;
}

export type AllTemplatesFilter = {
  start: number;
  limit: number;
}

export class Template {
  constructor(protected apikey: string) {}
  async create(body: CreateTemplate) {
    return request.core<TemplateInstance>(this.apikey, 'post', 'template/create', body)
  }
  async get(templateId: number) {
    return request.core<TemplateInstance>(this.apikey, 'get', 'template/get', {
      templateId,
    })
  }
  async getAll(start = 0, limit = 100, filter = '') {
    return request.core<Template[]>(this.apikey, 'get', 'template/get-all', {
      start,
      limit,
      ...(filter ? {
        filter,
      } : {}),
    })
  }
  async count(filter = '') {
    return request.core<Template[]>(this.apikey, 'get', 'template/count', filter ? {
      filter,
    } : {})
  }
  async update(templateId: number, props: AnyRecord) {
    return request.core<TemplateInstance>(this.apikey, 'put', 'template/mutate', {
      templateId,
      props,
    })
  }
  async remove(templateId: number) {
    return request.core<object>(this.apikey, 'delete', 'template/remove', {
      templateId,
    })
  }
  async propsRemove(templateId: number, props: string[]) {
    return request.core<object>(this.apikey, 'delete', 'template/props-remove', {
      templateId,
      props,
    })
  }
}
