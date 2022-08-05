import test from 'ava'
import { baselineBalances, toArray } from './utils'

test('toArray converts non arrays to arrays', (t) => {
  t.deepEqual(toArray({}), [{}])
  t.deepEqual(toArray([{}]), [{}])
})

test('holds baseline wallet balances data', (t) => {
  t.is(baselineBalances().length, 3)
})
