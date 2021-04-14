/* eslint-env mocha */
'use strict'

const assert = require('assert')
const findSubscription = require('../../../lib/ws2/find_subscription')

const bookSubscriptions = [
  {
    channel: 'book',
    prec: 'R0',
    len: '25'
  },
  {
    channel: 'book',
    prec: 'R0',
    len: '50'
  }
]

describe('ws2:find_subscription', () => {
  it('find subscription - not match', () => {
    const state = findSubscription([{ channel: 'auth' }], { channel: 'book' })

    assert.strictEqual(state, undefined)
  })

  it('find subscription - match strict', () => {
    const state = findSubscription(bookSubscriptions, { channel: 'book', len: '50' })

    assert.deepStrictEqual(state, bookSubscriptions[1])
  })

  it('find subscription - not match weak', () => {
    const state = findSubscription(bookSubscriptions, { channel: 'book', len: '50' }, true)

    assert.deepStrictEqual(state, undefined)
  })

  it('find subscription - match weak', () => {
    const state = findSubscription(bookSubscriptions, { channel: 'book', prec: 'R0', len: '50', someField: true }, true)

    assert.deepStrictEqual(state, bookSubscriptions[1])
  })
})
