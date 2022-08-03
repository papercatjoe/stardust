import anyTest, { TestFn } from 'ava'
import * as uuid from 'uuid'
import { Game } from './'
import * as config from './config'
import _ from 'lodash'
import * as utils from './utils'

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
  const { data } = await t.context.game.template.getAll()
  await Promise.all(data.map(({ id }) => (
    t.context.game.template.remove(id)
  )))
})

test('can create teamplate', async (t) => {
  const { data: template } = await t.context.game.template.create({
    name: 'a',
    cap: '1000',
    type: 'FT',
    props: {},
  })
  t.assert(_.isNumber(template.id))
})

test('can get template', async (t) => {
  const name = 'a'
  const { data: { id } } = await t.context.game.template.create({
    name,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  const { data: template } = await t.context.game.template.get(id)
  t.deepEqual(template, {
    gameId: config.gameId,
    cap: '1000',
    name,
    type: 'FT',
    props: {
      mutable: {
        image: utils.placeholderImage,
      },
      '$mutable': {},
      immutable: {}
    },
    id: template.id,
    totalSupply: '0',
    royalty: 0,
    fees: [ { feePercentage: 0, feeType: 'game_royalty' } ],
    image: t.context.game.template.image(config.gameId, template.id),
  })
})

test('can get all templates', async (t) => {
  t.timeout(10_000)
  const name1 = uuid.v4()
  const name2 = uuid.v4()
  const { data: { id: id1 } } = await t.context.game.template.create({
    name: name1,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  const { data: { id: id2 } } = await t.context.game.template.create({
    name: name2,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  const { data: templates } = await t.context.game.template.getAll()
  t.assert(!_.isUndefined(_.find(templates, { name: name1 })))
  t.assert(!_.isUndefined(_.find(templates, { name: name2 })))
})

test.serial('can get counts of templates', async (t) => {
  t.timeout(10_000)
  const name1 = uuid.v4()
  const { data: countBefore } = await t.context.game.template.count()
  t.is(countBefore.count, 0)
  const { data: { id: id1 } } = await t.context.game.template.create({
    name: name1,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  const { data: countAfter } = await t.context.game.template.count()
  t.is(countAfter.count, 1)
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
  const { data: { id: id1 } } = await t.context.game.template.create({
    name: name1,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  const { data: { id: id2 } } = await t.context.game.template.create({
    name: name2,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  const { data } = await t.context.game.template.getAll(0, 100, 'n4')
  t.deepEqual(data, [{
    gameId: config.gameId,
    cap: '1000',
    name: name2,
    type: 'FT',
    props: {
      mutable: {
        image: utils.placeholderImage,
      },
      '$mutable': {},
      immutable: {}
    },
    id: id2,
    totalSupply: '0',
    royalty: 0,
    image: t.context.game.template.image(config.gameId, id2),
  }])
})

test.serial('can count with a filter', async (t) => {
  t.timeout(10_000)
  const name1 = 'nghi'
  const name2 = 'njkl'
  await t.context.game.template.create({
    name: name1,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  await t.context.game.template.create({
    name: name2,
    cap: '1000',
    type: 'FT',
    props: {},
  })
  await utils.timeout(1_000)
  const { data } = await t.context.game.template.count('njk')
  console.log(data)
  t.deepEqual(data.count, 1)
})
