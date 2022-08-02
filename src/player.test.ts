import anyTest, { TestFn } from 'ava'
import * as ethers from 'ethers'
import _ from 'lodash'
import * as uuid from 'uuid'
import { Game } from '.'
import * as config from './config'
import { timeout, baselineBalances } from './utils'

const test = anyTest as TestFn<{
  noopGame: Game;
  game: Game;
  playerIds: string[],
}>

test.before((t) => {
  t.context = {
    noopGame: new Game(''),
    game: new Game(config.apikey),
    playerIds: [],
  }
})

test.afterEach(async (t) => {
  const { playerIds } = t.context
  await Promise.all(playerIds.map((playerId) => (
    t.context.game.player.remove(playerId)
  )))
})

const uniquePlayerId = () => `uniqemail+${uuid.v4()}@gmail.com`

test('can create a player', async (t) => {
  const {
    data
  } = await t.context.game.player.create(uniquePlayerId(), {
    env: 'test',
  })
  t.context.playerIds.push(data.playerId)
  t.assert(_.isObject(data))
  t.assert(uuid.validate(data.playerId))
  t.assert(_.isNumber(data.id))
  t.assert(_.isString(data.image))
})

test('can get a player by it\'s id', async (t) => {
  const {
    data
  } = await t.context.game.player.create(uniquePlayerId(), {
    env: 'test',
  })
  t.context.playerIds.push(data.playerId)
  const {
    data: player,
  } = await t.context.game.player.get(data.playerId)
  t.is(player.playerId, data.playerId)
})

test('can get a player by it\'s originating id', async (t) => {
  const uniqueId = uniquePlayerId()
  const {
    data
  } = await t.context.game.player.create(uniqueId)
  t.context.playerIds.push(data.playerId)
  const {
    data: player,
  } = await t.context.game.player.getPlayerId(uniqueId)
  t.is(player.playerId, data.playerId)
})

test.serial('can get all id pairs', async (t) => {
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  t.context.playerIds.push(data1.playerId)
  const {
    data: data2,
  } = await t.context.game.player.create(uniquePlayerId())
  t.context.playerIds.push(data2.playerId)
  const {
    data: playerIds,
  } = await t.context.game.player.getIds()
  t.assert(!_.isUndefined(_.find(playerIds, { playerId: data1.playerId })))
  t.assert(!_.isUndefined(_.find(playerIds, { playerId: data2.playerId })))
})

test.serial('can get all players', async (t) => {
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  t.context.playerIds.push(data1.playerId)
  const {
    data: data2,
  } = await t.context.game.player.create(uniquePlayerId())
  t.context.playerIds.push(data2.playerId)
  const {
    data: players,
  } = await t.context.game.player.getAll()
  t.assert(!_.isUndefined(_.find(players, { playerId: data1.playerId })))
  t.assert(!_.isUndefined(_.find(players, { playerId: data2.playerId })))
})

test.serial('can count the number of players', async (t) => {
  const { data: countBefore } = await t.context.game.player.count()
  t.is(countBefore.count, 0)
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  t.context.playerIds.push(data1.playerId)
  const { data: countAfter } = await t.context.game.player.count()
  t.is(countAfter.count, 1)
})

test.serial('can get wallet', async (t) => {
  const {
    data: data1,
  } = await t.context.game.player.create(uniquePlayerId())
  t.context.playerIds.push(data1.playerId)
  await timeout(2_000)
  const { data } = await t.context.game.player.getWallet(data1.playerId)
  const { wallet: [wallet] } = data
  t.is(wallet.blockchain, 'immutablex')
  t.assert(ethers.utils.getAddress(wallet.address))
  t.deepEqual(wallet.balances, baselineBalances())
})
