/* eslint-env mocha */
'use strict'

const assert = require('assert')
const cancelOrder = require('../../../../lib/ws2/orders/cancel')
const { Order } = require('bfx-api-node-models')

const defaultState = {
  ev: {
    off: () => {},
    once: (_, handler) => { handler() }
  },
  emit: () => {},
  transform: false
}

const order = new Order({
  id: 42,
  type: 'LIMIT',
  price: 123,
  amount: 12
})

describe('ws2:orders:cancel', () => {
  it('emits order cancel event with order ID', (done) => {
    cancelOrder({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'exec:order:cancel') {
          assert.deepStrictEqual(packet, order.id)
          done()
        }
      }
    }, order)
  })

  it('returns a promise that resolves on a matching oc-req notification', (done) => {
    cancelOrder({
      ...defaultState,
      ev: {
        off: () => {},
        once: (eventName, handler) => {
          if (eventName === 'n:oc-req:42:success') {
            handler()
            assert(handler)
            done()
          }
        }
      }
    }, order)
  })

  it('returns a promise that rejects on a matching oc-req error notification', (done) => {
    cancelOrder({
      ...defaultState,
      ev: {
        off: () => {},
        once: (eventName, handler) => {
          if (eventName === 'n:oc-req:42:error') {
            assert(handler)
            done()
          } else {
            handler()
          }
        }
      }
    }, order)
  })
})
