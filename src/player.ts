import _ from 'lodash'
import * as ethers from 'ethers'

import * as utils from './utils'
import * as request from './request'
import type { AnyRecord, Count } from './type'
import { AxiosError } from 'axios'

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

const timelyWithdrawal = new Error('unable to complete withdrawal in timely manner')

export class Player {
  constructor(protected apikey: string) {}
  get(playerId: string) {
    return request.core<PlayerInstance>(this.apikey, 'get', 'player/get', {
      playerId,
    })
  }
  getPlayerId(uniqueId: string) {
    return request.core<PlayerIdResponse>(this.apikey, 'get', 'player/get-id', {
      uniqueId: encodeURIComponent(uniqueId),
    })
  }
  getIds() {
    return request.core<PlayerIdsResponse[]>(this.apikey, 'get', 'player/get-ids')
  }
  getAll(start = 0, limit = 100) {
    return request.core<PlayerIdsResponse[]>(this.apikey, 'get', 'player/get-all', {
      start,
      limit,
    })
  }
  getInventory(playerId: string) {
    return request.core<Inventory[]>(this.apikey, 'get', 'player/get-inventory', {
      playerId,
    })
  }
  count() {
    return request.core<Count>(this.apikey, 'get', 'player/count')
  }
  getWallet(playerId: string) {
    return request.core<Wallet>(this.apikey, 'get', 'player/wallet-get', {
      playerId,
    })
  }
  create(uniqueId: string, userData = {}, image = '') {
    const props: CreatePlayerRequest = {
      uniqueId,
      userData,
    }
    if (image) {
      props.image = image
    }
    return request.core<CreatePlayerResponse>(this.apikey, 'post', 'player/create', props)
  }
  update(playerId: string, props: AnyRecord) {
    return request.core<Record<string, unknown>>(this.apikey, 'put', 'player/mutate', {
      playerId,
      props,
    })
  }
  remove(playerId: string) {
    return request.core<Record<string, unknown>>(this.apikey, 'delete', 'player/remove', {
      playerId,
    })
  }
  removeProps(playerId: string, props: string[]) {
    return request.core<Record<string, unknown>>(this.apikey, 'delete', 'player/props-remove', {
      playerId,
      props,
    })
  }
  withdraw(
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
  async retryIteration<T>(
    fn: () => Promise<T>,
    shouldRetry: (err: AxiosError) => boolean,
    timeout = 10_000,
    maxIteration = 60,
  ): Promise<T> {
    let iteration = maxIteration
    while (iteration--) {
      const response = await fn().catch((err: AxiosError) => {
        if (shouldRetry(err)) {
          return null
        }
        throw err
      })
      if (response) {
        return response
      }
      await utils.timeout(timeout)
      console.log('retry iteration', maxIteration - iteration)
    }
    throw timelyWithdrawal
  }
  withdrawalFailure(err: AxiosError) {
    const data = err.response?.data as {
      message: string;
      statusCode: number;
    }
    return data.message.startsWith('cannot estimate gas')
      && data.message.includes('UNPREDICTABLE_GAS_LIMIT')
      && data.statusCode === 500
  }
}
