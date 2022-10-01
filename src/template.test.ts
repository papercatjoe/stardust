import anyTest, { TestFn } from 'ava'
import * as uuid from 'uuid'
import _ from 'lodash'

import * as config from './config'
import * as utils from './utils'
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
  await testUtils.deleteAll.templates(t.context.game)
})

test('can create template', async (t) => {
  const { data: template } = await t.context.game.template.create({
    name: 'a',
    cap: '1000',
  })
  t.assert(_.isNumber(template.id))
})

test('can get template', async (t) => {
  const name = 'a'
  const { data: { id } } = await t.context.game.template.create({
    name,
    cap: '1000',
  })
  const { data: template } = await t.context.game.template.get(id)
  const { gameId } = template
  t.deepEqual(template, {
    activeListing: false,
    gameId,
    cap: '1000',
    name,
    type: 'FT',
    props: {
      'mutable': {
        image: utils.placeholderImage,
      },
      '$mutable': {},
      'immutable': {},
    },
    metadata: null,
    id: template.id,
    totalSupply: '0',
    royalty: 0,
    fees: [{ feePercentage: 0, feeType: 'game_royalty' }],
    image: t.context.game.template.image(gameId, template.id),
  })
})

test('can get all templates', async (t) => {
  t.timeout(10_000)
  const name1 = uuid.v4()
  const name2 = uuid.v4()
  await t.context.game.template.create({
    name: name1,
    cap: '1000',
  })
  await t.context.game.template.create({
    name: name2,
    cap: '1000',
  })
  const { data: templates } = await t.context.game.template.getAll()
  t.assert(!_.isUndefined(_.find(templates, { name: name1 })))
  t.assert(!_.isUndefined(_.find(templates, { name: name2 })))
})

test.serial('can get counts of templates', async (t) => {
  t.timeout(10_000)
  const name1 = uuid.v4()
  const { data: countBefore } = await t.context.game.template.count()
  t.is(countBefore.count + (config.template.id ? 0 : 1), 2)
  await t.context.game.template.create({
    name: name1,
    cap: '1000',
  })
  const { data: countAfter } = await t.context.game.template.count()
  t.is(countAfter.count + (config.template.id ? 0 : 1), 3)
})

test('can update templates', async (t) => {
  t.timeout(10_000)
  const name1 = uuid.v4()
  const { data: { id } } = await t.context.game.template.create({
    name: name1,
    cap: '1000',
    type: 'FT',
    props: {
      mutable: {
        a: 1,
      },
    },
  })
  const { data: templateBefore } = await t.context.game.template.get(id)
  t.is(templateBefore.props.mutable.a, 1)
  await t.context.game.template.update(id, {
    a: 2,
  })
  const { data: templateAfter } = await t.context.game.template.get(id)
  t.is(templateAfter.props.mutable.a, 2)
})

test('can remove template props', async (t) => {
  t.timeout(10_000)
  const name1 = uuid.v4()
  const { data: { id } } = await t.context.game.template.create({
    name: name1,
    cap: '1000',
    type: 'FT',
    props: {
      mutable: {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      },
    },
  })
  await t.context.game.template.removeProps(id, ['a', 'c'])
  const { data } = await t.context.game.template.get(id)
  t.deepEqual(data.props.mutable, {
    image: utils.placeholderImage,
    b: 2,
    d: 4,
  })
})

test('can get with a filter', async (t) => {
  t.timeout(10_000)
  const name1 = 'n123'
  const name2 = 'n456'
  await t.context.game.template.create({
    name: name1,
    cap: '1000',
  })
  const { data: { id: id2 } } = await t.context.game.template.create({
    name: name2,
    cap: '1000',
  })
  const { data } = await t.context.game.template.getAll(0, 100, 'n4')
  const { gameId } = data[0]
  t.deepEqual(data, [{
    activeListing: false,
    gameId,
    cap: '1000',
    name: name2,
    type: 'FT',
    props: {
      'mutable': {
        image: utils.placeholderImage,
      },
      '$mutable': {},
      'immutable': {},
    },
    metadata: null,
    id: id2,
    totalSupply: '0',
    royalty: 0,
    image: t.context.game.template.image(gameId, id2),
  }])
})

test.serial('can count with a filter', async (t) => {
  t.timeout(10_000)
  const name1 = 'nghi'
  const name2 = 'njkl'
  await t.context.game.template.create({
    name: name1,
    cap: '1000',
  })
  await t.context.game.template.create({
    name: name2,
    cap: '1000',
  })
  await utils.timeout(1_000)
  const { data } = await t.context.game.template.count(name2)
  t.deepEqual(data.count, 1)
})
