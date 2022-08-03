import _ from 'lodash'

import type { AnyRecord } from './type'
import * as utils from './utils'
import * as request from './request'
import { Template } from './template'

export type TokenProps = {
  inherited: AnyRecord;
  immutable: AnyRecord;
  mutable: AnyRecord;
}

export type TokenInstance = {
  templateId: number;
  id: number;
  name: string;
  props: TokenProps;
}

export type CreateToken = {
  templateId: number;
  amount: string;
  props?: TokenProps;
}

export type TokenIdentifier = {
  tokenId: number;
  amount: string;
}

export class Token {
  template: Template
  constructor(protected apikey: string) {
    this.template = new Template(apikey)
  }
  async get(tokenIds: number[]) {
    return request.core<TokenInstance[]>(this.apikey, 'get', 'token/get', {
      tokenIds,
    })
  }
  async checkNoFungibleProps(tokenObjects: CreateToken[]) {
    const uniqueTemplateIds = _(tokenObjects).map('templateId').uniq().value()
    const templates = await Promise.all(uniqueTemplateIds.map((templateId) => (
      this.template.get(templateId)
        .then(({ data }) => data)
    )))
    const templateById = _.keyBy(templates, 'id')
    tokenObjects.forEach((token) => {
      if (templateById[token.templateId].type === 'FT') {
        if (Object.keys(token.props || {}).length) {
          throw new Error('unable to set props on a mint for a fungible token')
        }
      }
    })
  }
  async mint(playerId: string, tokens: CreateToken | CreateToken[]) {
    const tokenObjects = utils.toArray(tokens)
    await this.checkNoFungibleProps(tokenObjects)
    return request.core<number[]>(this.apikey, 'post', 'token/mint-bulk', {
      playerId,
      tokenObjects,
    })
  }
  async transfer(fromPlayerId: string, toPlayerId: string, tokens: TokenIdentifier | TokenIdentifier[]) {
    const tokenObjects = utils.toArray(tokens)
    return request.core<Record<string, unknown>>(this.apikey, 'post', 'token/transfer', {
      fromPlayerId,
      toPlayerId,
      tokenObjects,
    })
  }
  async burn(playerId: string, tokens: TokenIdentifier | TokenIdentifier[]) {
    const tokenObjects = utils.toArray(tokens)
    return request.core<Record<string, unknown>>(this.apikey, 'post', 'token/burn', {
      playerId,
      tokenObjects,
    })
  }
  async update(tokenId: number, props = {} as AnyRecord) {
    return request.core<Record<string, unknown>>(this.apikey, 'put', 'token/mutate', {
      tokenId,
      props,
    })
  }
  async removeProps(tokenId: number, props: string[]) {
    return request.core<Record<string, unknown>>(this.apikey, 'delete', 'token/props-remove', {
      tokenId,
      props,
    })
  }
}
