/* eslint-env mocha */
'use strict'

const assert = require('assert')
const setFlag = require('../../../../lib/ws2/flags/set')

const defaultState = {
  isOpen: true,
  ws: {
    send: () => {}
  },
  ev: {
    emit: () => {}
  }
}

describe('ws2:flags:set', () => {
  it('sends conf packet', (done) => {
    const flags = 42

    setFlag({
      ...defaultState,
      ws: {
        send: (json) => {
          const packet = JSON.parse(json)

          assert.deepStrictEqual(packet, {
            event: 'conf',
            flags
          })
          done()
        }
      }
    }, flags)
  })

  it('updates flags on state', () => {
    const nextState = setFlag({ ...defaultState }, 42)
    assert.strictEqual(nextState.flags, 42)
  })

  it('emits flag update event', (done) => {
    setFlag({
      ...defaultState,
      ev: {
        emit: (eventName, data) => {
          if (eventName === 'exec:flags:set') {
            assert.strictEqual(data, 42)
            done()
          }
        }
      }
    }, 42)
  })

  it('does not emit flag update event if silent is passed', (done) => {
    setFlag({
      ...defaultState,
      ev: {
        emit: (eventName) => {
          if (eventName === 'exec:flags:set') {
            done(new Error('flag event should not have been emitted'))
          }
        }
      }
    }, 42, true)

    done()
  })
})
