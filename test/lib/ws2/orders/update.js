/* eslint-env mocha */
'use strict'

const assert = require('assert')
const updateOrder = require('../../../../lib/ws2/orders/update')

const defaultState = {
  ev: {
    once: () => {}
  },
  emit: () => {},
  transform: false
}

const changes = {
  id: 42,
  delta: 12
}

describe('ws2:orders:update', () => {
  it('emits order update event with the changeset', (done) => {
    updateOrder({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'exec:order:update') {
          assert.deepStrictEqual(packet, changes)
          done()
        }
      }
    }, changes)
  })

  it('returns a promise that resolves on a matching ou-req notification', (done) => {
    updateOrder({
      ...defaultState,
      ev: {
        once: (eventName, handler) => {
          if (eventName === 'n:ou-req:42:success') {
            assert(handler)
            done()
          }
        }
      }
    }, changes)
  })

  it('returns a promise that rejects on a matching ou-req error notification', (done) => {
    updateOrder({
      ...defaultState,
      ev: {
        once: (eventName, handler) => {
          if (eventName === 'n:ou-req:42:error') {
            assert(handler)
            done()
          }
        }
      }
    }, changes)
  })
})
