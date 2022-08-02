import _ from 'lodash'
import * as ethers from 'ethers'

import * as common from './common'
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
    return common.core<PlayerInstance>(this.apikey, 'get', 'player/get', {
      playerId,
    })
  }
  async getPlayerId(uniqueId: string) {
    return common.core<PlayerIdResponse>(this.apikey, 'get', 'player/get-id', {
      uniqueId,
    })
  }
  async getIds() {
    return common.core<PlayerIdsResponse[]>(this.apikey, 'get', 'player/get-ids')
  }
  async getAll(start = 0, limit = 10_000) {
    return common.core<PlayerIdsResponse[]>(this.apikey, 'get', 'player/get-all', {
      start,
      limit,
    })
  }
  async getInventory(playerId: string) {
    return common.core<Inventory[]>(this.apikey, 'get', 'player/get-inventory', {
      playerId,
    })
  }
  async getPlayerCount() {
    return common.core<Count>(this.apikey, 'get', 'player/count')
  }
  async getWallet(playerId: string) {
    return common.core<Wallet>(this.apikey, 'get', 'player/wallet', {
      playerId,
    })
  }
  async create(props: CreatePlayerRequest) {
    return common.core<CreatePlayerResponse>(this.apikey, 'post', 'player/create', props)
  }
  async update(props: UpdatePlayerRequest) {
    return common.core<object>(this.apikey, 'put', 'player/mutate', props)
  }
  async remove(playerId: string) {
    return common.core<object>(this.apikey, 'delete', 'player/remove', {
      playerId,
    })
  }
  async propsRemove(playerId: string, props: string[]) {
    return common.core<object>(this.apikey, 'delete', 'player/props-remove', {
      playerId,
      props,
    })
  }
  async withdraw(
    playerId: string,
    address: string,
    tokens: TokenAmount | TokenAmount[],
  ) {
    return common.core<Withdrawal[]>(this.apikey, 'post', 'player/withdraw', {
      playerId,
      address: ethers.utils.getAddress(address),
      tokenObjects: _.isArray(tokens) ? tokens : [tokens],
    })
  }
}
