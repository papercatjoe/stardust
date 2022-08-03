import anyTest, { TestFn } from 'ava'
import * as ethers from 'ethers'
import _ from 'lodash'
import * as uuid from 'uuid'
import { AxiosError } from 'axios'

import * as config from './config'
import { baselineBalances, uniquePlayerId } from './utils'
import * as testUtils from './tst-utils'

import { Game } from '.'

const test = anyTest as TestFn<{
  noopGame: Game;
  game: Game;
}>

test.before((t) => {
  t.context = {
    noopGame: new Game(''),
    game: new Game(config.apikey),
  }
})

test.after.always(async (t) => {
  await testUtils.deleteAll.players(t.context.game)
})

test('can create a player', async (t) => {
  const {
    data,
  } = await t.context.game.player.create(uniquePlayerId(), {}, 'abc')
  t.assert(_.isObject(data))
  t.assert(uuid.validate(data.playerId))
  t.assert(_.isNumber(data.id))
  t.assert(_.isString(data.image))
})

test('can get a player by its id', async (t) => {
  const {
    data,
  } = await t.context.game.player.create(uniquePlayerId())
  const {
    data: player,
  } = await t.context.game.player.get(data.playerId)
  t.is(player.playerId, data.playerId)
})

test('can get a player by its originating id', async (t) => {
  const uniqueId = uniquePlayerId()
  const {
    data,
  } = await t.context.game.player.create(uniqueId)
  const {
    data: player,
  } = await t.context.game.player.getPlayerId(uniqueId)
  t.is(player.playerId, data.playerId)
})

test('can update a player', async (t) => {
  const {
    data,
  } = await t.context.game.player.create(uniquePlayerId())
  await t.context.game.player.update(data.playerId, {
    env: 'test',
  })
  const {
    data: player,
  } = await t.context.game.player.get(data.playerId)
  t.is(player.playerId, data.playerId)
  t.deepEqual(player.userData, {
    env: 'test',
  })
})

test('can remove a player', async (t) => {
  const uniqueId = uniquePlayerId()
  const {
    data,
  } = await t.context.game.player.create(uniqueId)
  const { data: player } = await t.context.game.player.get(data.playerId)
  await t.context.game.player.remove(data.playerId)
  const response = await t.context.game.player.get(data.playerId)
    .catch((err: AxiosError<string>) => err.response)
  t.deepEqual(response?.data, {
    message: `Unable to find player by playerId:${data.playerId} in game:${player.gameId}`,
    statusCode: 500,
  })
})

test('can remove a player\'s props', async (t) => {
  const uniqueId = uniquePlayerId()
  const {
    data,
  } = await t.context.game.player.create(uniqueId, {
    env: 'test',
    a: 1,
    b: 2,
    c: 3,
  })
  await t.context.game.player.removeProps(data.playerId, ['env', 'a'])
  const { data: player } = await t.context.game.player.get(data.playerId)
  t.deepEqual(player.userData, {
    b: 2,
    c: 3,
  })
})

test('can get all id pairs', async (t) => {
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  const {
    data: data2,
  } = await t.context.game.player.create(uniquePlayerId())
  const {
    data: playerIds,
  } = await t.context.game.player.getIds()
  t.assert(!_.isUndefined(_.find(playerIds, { playerId: data1.playerId })))
  t.assert(!_.isUndefined(_.find(playerIds, { playerId: data2.playerId })))
})

test('can get all players', async (t) => {
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  const {
    data: data2,
  } = await t.context.game.player.create(uniquePlayerId())
  const {
    data: players,
  } = await t.context.game.player.getAll()
  t.assert(!_.isUndefined(_.find(players, { playerId: data1.playerId })))
  t.assert(!_.isUndefined(_.find(players, { playerId: data2.playerId })))
})

test.serial('can count the number of players', async (t) => {
  const { data: countBefore } = await t.context.game.player.count()
  if (countBefore.count) {
    console.log((await t.context.game.player.getAll()).data)
  }
  t.is(countBefore.count, 0)
  await t.context.game.player.create(uniquePlayerId())
  const { data: countAfter } = await t.context.game.player.count()
  t.is(countAfter.count, 1)
})

test('can get wallet', async (t) => {
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  const { data } = await t.context.game.player.getWallet(data1.playerId)
  const { wallet: [wallet] } = data
  t.is(wallet.blockchain, 'immutablex')
  t.assert(ethers.utils.getAddress(wallet.address))
  t.deepEqual(wallet.balances, baselineBalances())
})
