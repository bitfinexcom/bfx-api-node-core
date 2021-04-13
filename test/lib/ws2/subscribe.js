/* eslint-env mocha */
'use strict'

const assert = require('assert')
const subscribe = require('../../../lib/ws2/subscribe')

const defaultState = {
  pendingSubscriptions: [],
  channels: {},
  sendBuffer: [],
  emit: () => {}
}

describe('ws2:subscribe', () => {
  it('has pending subscription', () => {
    const nextState = subscribe(defaultState, 'book', {
      prec: 'R0',
      len: '25'
    })
    assert.deepStrictEqual(nextState.pendingSubscriptions, [{
      channel: 'book',
      prec: 'R0',
      len: '25'
    }])
  })

  it('prevent duplicate pending subscriptions', () => {
    const nextState = subscribe(defaultState, 'book', {
      prec: 'R0',
      len: '25'
    })
    const nextState2 = subscribe(nextState, 'book', {
      prec: 'R0',
      len: '25'
    })
    assert.deepStrictEqual(nextState2.pendingSubscriptions, [{
      channel: 'book',
      prec: 'R0',
      len: '25'
    }])
  })
})
