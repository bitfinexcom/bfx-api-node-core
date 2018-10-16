/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onNotificationMessage = require('ws2/messages/notifications')
const { Notification } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => {}
}

const channel = {
  chanId: 0
}

describe('ws2:messages:notifications', () => {
  it('emits raw data if not transforming', (done) => {
    const nMessage = [0, 'n', [Date.now(), 'info', 23, null, {}, 0, 'SUCCESS', '']]

    onNotificationMessage({
      channel,
      msg: nMessage,
      payload: nMessage[2],
      state: {
        ...defaultState,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:notification') {
            const { msg, original, requested } = packet
            assert.deepStrictEqual(msg, nMessage)
            assert.deepStrictEqual(original, nMessage[2])
            assert.deepStrictEqual(requested, nMessage[2])
            done()
          }
        }
      }
    })
  })

  it('emits transformed notifications if necessary', (done) => {
    const nMessage = [0, 'n', [Date.now(), 'info', 23, null, {}, 0, 'SUCCESS', '']]

    onNotificationMessage({
      channel,
      msg: nMessage,
      payload: nMessage[2],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:notification') {
            const { msg, original, requested } = packet
            assert.deepStrictEqual(msg, nMessage)
            assert.deepStrictEqual(original, nMessage[2])
            assert(requested instanceof Notification)
            done()
          }
        }
      }
    })
  })

  it('emits order close events', (done) => {
    const nMessage = [0, 'n', [Date.now(), 'oc-req', 23, null, [
      42 // no need to mock the other order fields
    ], 0, 'SUCCESS', '']]

    onNotificationMessage({
      channel,
      msg: nMessage,
      payload: nMessage[2],
      state: {
        ...defaultState,
        emit: (eventName, data, payload) => {
          if (eventName === 'n:oc-req:42:success') {
            assert.deepStrictEqual(data, [42])
            assert.deepStrictEqual(payload, [42])
            done()
          }
        }
      }
    })
  })

  it('emits order update events', (done) => {
    const nMessage = [0, 'n', [Date.now(), 'ou-req', 23, null, [
      42 // no need to mock the other order fields
    ], 0, 'SUCCESS', '']]

    onNotificationMessage({
      channel,
      msg: nMessage,
      payload: nMessage[2],
      state: {
        ...defaultState,
        emit: (eventName, data, payload) => {
          if (eventName === 'n:ou-req:42:success') {
            assert.deepStrictEqual(data, [42])
            assert.deepStrictEqual(payload, [42])
            done()
          }
        }
      }
    })
  })

  it('emits new order events', (done) => {
    const nMessage = [0, 'n', [Date.now(), 'on-req', 23, null, [
      0, 235, 42 // NOTE: filters by cid, since ID cannot be known before
    ], 0, 'SUCCESS', '']]

    onNotificationMessage({
      channel,
      msg: nMessage,
      payload: nMessage[2],
      state: {
        ...defaultState,
        emit: (eventName, data, payload) => {
          if (eventName === 'n:on-req:42:success') {
            assert.deepStrictEqual(data, [0, 235, 42])
            assert.deepStrictEqual(payload, [0, 235, 42])
            done()
          }
        }
      }
    })
  })
})
