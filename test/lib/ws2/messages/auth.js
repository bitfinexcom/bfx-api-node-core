/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onAuthMessage = require('../../../../lib/ws2/messages/auth')
const { Position } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => {}
}

describe('ws2:messages:auth', () => {
  it('forwards notifications to notifications handler', (done) => {
    onAuthMessage({
      msg: [0, 'n', []],
      state: {
        ...defaultState,
        emit: (eventName, data = {}) => {
          const { original } = data

          if (eventName === 'data:notification') {
            assert.deepStrictEqual(original, [])
            done()
          }
        }
      }
    })
  })

  it('throws error if transform is true and data type is unknown', (done) => {
    try {
      onAuthMessage({
        msg: [32, 'unknown', []],
        state: {
          ...defaultState,
          transform: true
        }
      })
    } catch (e) {
      done()
    }
  })

  it('emits data:auth event with raw data', (done) => {
    onAuthMessage({
      msg: [0, 'ps', [42]],
      state: {
        ...defaultState,
        emit: (eventName, packet = []) => {
          if (eventName === 'data:auth') {
            const [chanId, type, data, transformed] = packet
            assert.strictEqual(chanId, 0)
            assert.strictEqual(type, 'ps')
            assert.deepStrictEqual(data, [42])
            assert(transformed instanceof Position)
            done()
          }
        }
      }
    })
  })

  it('emits data:auth event with transformed data if necessary', (done) => {
    onAuthMessage({
      msg: [0, 'ps', [42]],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = []) => {
          if (eventName === 'data:auth') {
            const [chanId, type, data, transformed] = packet
            assert.strictEqual(chanId, 0)
            assert.strictEqual(type, 'ps')
            assert(data instanceof Position)
            assert(transformed instanceof Position)
            done()
          }
        }
      }
    })
  })
})
