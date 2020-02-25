/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onUnsubscribedEvent = require('../../../../lib/ws2/events/unsubscribed')

const defaultState = {
  pendingUnsubscriptions: [],
  channels: {},
  emit: () => {}
}

describe('ws2:events:unsubscribed', () => {
  it('emits unsubscribed event', (done) => {
    const packet = { chanId: -1 }

    onUnsubscribedEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'event:unsubscribed') {
          assert.deepStrictEqual(data, packet)
          done()
        }
      }
    }, packet)
  })

  it('removes channel from state pending unsubs list', () => {
    const packet = { chanId: 42 }
    const nextState = onUnsubscribedEvent({
      ...defaultState,
      pendingUnsubscriptions: [40, 41, 42]
    }, packet)

    assert.deepStrictEqual(nextState.pendingUnsubscriptions, [40, 41])
  })

  it('removes channel from state channel map', () => {
    const packet = { chanId: 42 }
    const nextState = onUnsubscribedEvent({
      ...defaultState,
      channels: {
        42: {
          channel: 'trades',
          symbol: 'tBTCUSD'
        }
      }
    }, packet)

    assert.deepStrictEqual(nextState.channels, {})
  })
})
