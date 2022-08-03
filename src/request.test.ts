import anyTest, { TestFn } from 'ava'
import { GameInstance } from './type'
import * as config from './config'
import * as request from './request'

const test = anyTest as TestFn<{}>

test('can hit marketplace', async (t) => {
  const gameId = 1
  const {
    data,
  } = await request.marketplace<GameInstance>(config.apikey, 'get', 'game/get', {
    gameId,
  })
  t.is(data.id, gameId)
})
