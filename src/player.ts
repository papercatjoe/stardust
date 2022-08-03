import _ from 'lodash'
import * as ethers from 'ethers'

import * as utils from './utils'
import * as request from './request'
import type { AnyRecord, Count } from './type'

export type PlayerIdResponse = {
  playerId: string;
}

export type PlayerIdsResponse = PlayerIdResponse & {
  uniqueId: string;
}

export type PlayerInstance = PlayerIdsResponse & {
  gameId: number;
  id: number;
  lastSeen: string;
  image: string;
  userData: AnyRecord;
}

export type Inventory = {
  tokenId: number;
  amount: string;
}

export type BlockchainWallet = {
  blockchain: string;
  address: string;
  balances: never[];
}

export type Wallet = {
  wallet: BlockchainWallet[];
}

export type CreatePlayerRequest = {
  uniqueId: string;
  userData: AnyRecord;
  image?: string;
}

export type CreatePlayerResponse = {
  id: number;
  playerId: string;
  image: string;
}

export type TokenAmount = {
  tokenId: number;
  amount: string;
}

export type Withdrawal = {
  tokenId: number;
  amount: string;
  hash: string;
}

export type UpdatePlayerRequest = {
  playerId: string;
  props: AnyRecord;
}

export class Player {
  constructor(protected apikey: string) {}
  async get(playerId: string) {
    return request.core<PlayerInstance>(this.apikey, 'get', 'player/get', {
      playerId,
    })
  }
  async getPlayerId(uniqueId: string) {
    return request.core<PlayerIdResponse>(this.apikey, 'get', 'player/get-id', {
      uniqueId: encodeURIComponent(uniqueId),
    })
  }
  async getIds() {
    return request.core<PlayerIdsResponse[]>(this.apikey, 'get', 'player/get-ids')
  }
  async getAll(start = 0, limit = 100) {
    return request.core<PlayerIdsResponse[]>(this.apikey, 'get', 'player/get-all', {
      start,
      limit,
    })
  }
  async getInventory(playerId: string) {
    return request.core<Inventory[]>(this.apikey, 'get', 'player/get-inventory', {
      playerId,
    })
  }
  async count() {
    return request.core<Count>(this.apikey, 'get', 'player/count')
  }
  async getWallet(playerId: string) {
    return request.core<Wallet>(this.apikey, 'get', 'player/wallet-get', {
      playerId,
    })
  }
  async create(uniqueId: string, userData = {}, image = '') {
    return request.core<CreatePlayerResponse>(this.apikey, 'post', 'player/create', image ? {
      uniqueId,
      userData,
      image,
    } : {
      uniqueId,
      userData,
    })
  }
  async update(playerId: string, props: AnyRecord) {
    return request.core<Record<string, unknown>>(this.apikey, 'put', 'player/mutate', {
      playerId,
      props,
    })
  }
  async remove(playerId: string) {
    return request.core<Record<string, unknown>>(this.apikey, 'delete', 'player/remove', {
      playerId,
    })
  }
  async removeProps(playerId: string, props: string[]) {
    return request.core<Record<string, unknown>>(this.apikey, 'delete', 'player/props-remove', {
      playerId,
      props,
    })
  }
  async withdraw(
    playerId: string,
    address: string,
    tokens: TokenAmount | TokenAmount[],
  ) {
    return request.core<Withdrawal[]>(this.apikey, 'post', 'player/withdraw', {
      playerId,
      address: ethers.utils.getAddress(address),
      tokenObjects: utils.toArray(tokens),
    })
  }
}
