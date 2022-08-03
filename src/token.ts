import _ from 'lodash'

import type { AnyRecord } from './type'
import * as request from './request'

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
  props: AnyRecord;
}

export type TokenIdentifier = {
  tokenId: number;
  amount: string;
}

export class Token {
  constructor(protected apikey: string) {}
  async get(tokenIds: number[]) {
    return request.core<TokenInstance[]>(this.apikey, 'get', 'token/get', {
      tokenIds,
    })
  }
  async mint(playerId: string, tokens: CreateToken | CreateToken[]) {
    return request.core<number[]>(this.apikey, 'post', 'token/mint-bulk', {
      playerId,
      tokenObjects: _.isArray(tokens) ? tokens : [tokens],
    })
  }
  async transfer(fromPlayer: string, toPlayer: string, tokens: TokenIdentifier | TokenIdentifier[]) {
    return request.core<object>(this.apikey, 'post', 'token/transfer', {
      fromPlayer,
      toPlayer,
      tokenObjects: _.isArray(tokens) ? tokens : [tokens],
    })
  }
  async burn(playerId: string, tokens: TokenIdentifier | TokenIdentifier[]) {
    return request.core<object>(this.apikey, 'post', 'token/burn', {
      playerId,
      tokenObjects: _.isArray(tokens) ? tokens : [tokens],
    })
  }
  async update(tokenId: number, props = {} as AnyRecord) {
    return request.core<object>(this.apikey, 'put', 'token/mutate', {
      tokenId,
      props,
    })
  }
  async removeProps(tokenId: number, props: string[]) {
    return request.core<object>(this.apikey, 'delete', 'token/props-remove', {
      tokenId,
      props,
    })
  }
}
