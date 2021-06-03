/* eslint-env mocha */
'use strict'

const assert = require('assert')
const cancelOrderByGid = require('../../../../lib/ws2/orders/cancel_by_gid')

const defaultState = {
  ev: {
    off: () => {},
    once: (_, handler) => { handler() }
  },
  emit: () => {},
  transform: false
}

const gid = 1234

describe('ws2:orders:cancel_by_gid', () => {
  it('emits order cancel event with order GID', (done) => {
    cancelOrderByGid({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'exec:order:cancel-by-gid') {
          assert.deepStrictEqual(packet, gid)
          done()
        }
      }
    }, { gid })
  })

  it('returns a promise that resolves on a matching oc_multi-req notification', (done) => {
    cancelOrderByGid({
      ...defaultState,
      ev: {
        off: () => {},
        once: (eventName, handler) => {
          if (eventName === `n:oc_multi-req:${gid}:success`) {
            handler()
            assert(handler)
            done()
          }
        }
      }
    }, { gid })
  })

  it('returns a promise that rejects on a matching oc_multi-req error notification', (done) => {
    cancelOrderByGid({
      ...defaultState,
      ev: {
        off: () => {},
        once: (eventName, handler) => {
          if (eventName === `n:oc_multi-req:${gid}:error`) {
            assert(handler)
            done()
          } else {
            handler()
          }
        }
      }
    }, { gid })
  })
})
