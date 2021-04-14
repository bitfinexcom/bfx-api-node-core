/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onSubscribedEvent = require('../../../../lib/ws2/events/subscribed')

const defaultState = {
  pendingSubscriptions: [],
  channels: {},
  emit: () => {}
}

describe('ws2:events:subscribed', () => {
  it('emits subscribed event', (done) => {
    const packet = { chanId: -1 }

    onSubscribedEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'event:subscribed') {
          assert.deepStrictEqual(data, packet)
          done()
        }
      }
    }, packet)
  })

  it('removes pending subscription from state', () => {
    const packet = {
      chanId: 52,
      channel: 'trades',
      symbol: 'tBTCUSD'
    }

    const nextState = onSubscribedEvent({
      ...defaultState,
      pendingSubscriptions: [
        {
          channel: 'book',
          prec: 'R0',
          len: '25'
        },
        {
          channel: 'trades',
          symbol: 'tBTCUSD'
        }
      ]
    }, packet)

    assert.deepStrictEqual(nextState.pendingSubscriptions, [{
      channel: 'book',
      prec: 'R0',
      len: '25'
    }])
  })

  it('creates channel in state channel map', () => {
    const packet = {
      chanId: 52,
      channel: 'trades',
      symbol: 'tBTCUSD'
    }

    const nextState = onSubscribedEvent({ ...defaultState }, packet)

    assert.deepStrictEqual(nextState.channels[52], packet)
  })
})
