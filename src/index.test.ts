import anyTest, { TestFn } from 'ava'
import _ from 'lodash'
import * as config from './config'
import { Game } from './index'

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

test('reates a game object', (t) => {
  t.assert(t.context.noopGame instanceof Game)
})

test('the server status can be retrieved', async (t) => {
  const result = await t.context.game.health.check()
    .catch((err) => err.response.data)
  t.deepEqual(result.data || result, {
    status: 'OK',
  })
})

test('the game instance can be retrieved', async (t) => {
  const { data } = await t.context.game.get()
  t.assert(_.isString(data.name))
})
