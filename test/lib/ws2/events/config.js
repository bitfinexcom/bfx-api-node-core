/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onConfigEvent = require('ws2/events/config')

const defaultState = {
  emit: () => {}
}

const successPacket = {
  status: 'OK',
  flags: 0
}

const errorPacket = {
  status: 'ERROR',
  flags: 0
}

describe('ws2:events:config', () => {
  it('emits config event', (done) => {
    onConfigEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:config') {
          assert.deepStrictEqual(packet, successPacket)
          done()
        }
      }
    }, successPacket)
  })

  it('emits error event if config failed', (done) => {
    onConfigEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'error') {
          assert(data instanceof Error)
          done()
        }
      }
    }, errorPacket)
  })

  it('emits config error event if config failed', (done) => {
    onConfigEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:config:error') {
          assert.deepStrictEqual(packet, errorPacket)
          done()
        }
      }
    }, errorPacket)
  })

  it('emits config success event if config succeeded', (done) => {
    onConfigEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:config:success') {
          assert.deepStrictEqual(packet, successPacket)
          done()
        }
      }
    }, successPacket)
  })

  it('updates state flags if config succeeded', () => {
    const nextState = onConfigEvent(defaultState, successPacket)
    assert.equal(nextState.flags, 0)
  })
})
