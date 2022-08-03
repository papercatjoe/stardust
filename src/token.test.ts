import anyTest, { TestFn } from 'ava'
import * as ethers from 'ethers'
import * as uuid from 'uuid'
import _ from 'lodash'
import { AxiosError, AxiosResponse } from 'axios'

import * as config from './config'
import { placeholderImage, uniquePlayerId } from './utils'
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
  await testUtils.deleteAll.tokens(t.context.game)
  await testUtils.deleteAll.players(t.context.game)
  await testUtils.deleteAll.templates(t.context.game)
})

test('efficient coverage', async (t) => {
  t.timeout(20_000)
  const { data: player1 } = await t.context.game.player.create(uniquePlayerId())
  const { data: player2 } = await t.context.game.player.create(uniquePlayerId())
  const name = uuid.v4()
  const { data: template } = await t.context.game.template.create({
    name,
    cap: '100000',
  })
  let caught = false
  try {
    await t.context.game.token.mint(player1.playerId, {
      templateId: template.id,
      amount: '1000',
      props: {
        immutable: {},
        inherited: {},
        mutable: {
          a: 1,
        },
      },
    })
  } catch (err) {
    caught = true
  }
  t.assert(caught)
  const { data: tokens1 } = await t.context.game.token.mint(player1.playerId, {
    templateId: template.id,
    amount: '1000',
  })
  t.is(tokens1.length, 1)
  tokens1.map((token) => t.assert(_.isNumber(token)))
  const { data: tokens } = await t.context.game.token.get(tokens1)
  t.deepEqual(tokens, [{
    templateId: template.id,
    id: tokens1[0],
    name,
    props: {
      inherited: {
        image: placeholderImage,
      },
      immutable: {},
      mutable: {},
    },
  }])
  await t.context.game.token.update(tokens[0].id, {
    a: 3,
    c: 4,
  })
  const { data: tokensAfterUpdate } = await t.context.game.token.get(tokens1)
  t.deepEqual(tokensAfterUpdate, [{
    templateId: template.id,
    id: tokens1[0],
    name,
    props: {
      inherited: {
        image: placeholderImage,
      },
      immutable: {},
      mutable: {
        a: 3,
        c: 4,
      },
    },
  }])
  await t.context.game.token.removeProps(tokens[0].id, ['b', 'c'])
  const { data: tokensAfterPropRemove } = await t.context.game.token.get(tokens1)
  t.deepEqual(tokensAfterPropRemove, [{
    templateId: template.id,
    id: tokens1[0],
    name,
    props: {
      inherited: {
        image: placeholderImage,
      },
      immutable: {},
      mutable: {
        a: 3,
      },
    },
  }])
  const { data: equipment } = await t.context.game.player.getInventory(player1.playerId)
  const { data: tokens2 } = await t.context.game.token.mint(player2.playerId, {
    templateId: template.id,
    amount: '1000',
  })
  t.is(tokens2.length, 1)
  tokens2.map((token) => t.assert(_.isNumber(token)))

  const response = await t.context.game.token.transfer(player1.playerId, player2.playerId, {
    amount: equipment[0].amount,
    tokenId: tokens2[0],
  }).catch((err: AxiosError<{ message: string }>) => err.response as AxiosResponse<{ message: string }>)
  t.deepEqual(response?.data, {
    displayMessage: '',
    errorCode: 'player_validation_error',
    message: response?.data?.message,
    statusCode: 400,
  })
})

test('can withdraw', async (t) => {
  t.timeout(20_000)
  const { data: player1 } = await t.context.game.player.create(uniquePlayerId())
  const name = uuid.v4()
  const { data: template } = await t.context.game.template.create({
    name,
    cap: '100000',
  })
  const amount = '1000'
  const { data: tokens1 } = await t.context.game.token.mint(player1.playerId, {
    templateId: template.id,
    amount,
  })
  const randomWallet = ethers.Wallet.createRandom()
  const publicAddress = await randomWallet.getAddress()
  await Promise.all(tokens1.map(async (token) => {
    await t.context.game.player.withdraw(player1.playerId, publicAddress, {
      tokenId: token,
      amount,
    })
  }))
})
