/* eslint-env mocha */
'use strict'

const assert = require('assert')
const submitOrder = require('../../../../lib/ws2/orders/submit')
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
  cid: 42,
  type: 'LIMIT',
  price: 123,
  amount: 12
})

describe('ws2:orders:submit', () => {
  it('emits order submit event with new-order packet', (done) => {
    submitOrder({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'exec:order:submit') {
          assert.deepStrictEqual(packet, order.toNewOrderPacket())
          done()
        }
      }
    }, order)
  })

  it('returns a promise that resolves on a matching on-req notification', (done) => {
    submitOrder({
      ...defaultState,
      ev: {
        off: () => {},
        once: (eventName, handler) => {
          if (eventName === 'n:on-req:42:success') {
            handler()
            assert(handler)
            done()
          }
        }
      }
    }, order)
  })

  it('returns a promise that rejects on a matching on-req error notification', (done) => {
    submitOrder({
      ...defaultState,
      ev: {
        off: () => {},
        once: (eventName, handler) => {
          if (eventName === 'n:on-req:42:error') {
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
