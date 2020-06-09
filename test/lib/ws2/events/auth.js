/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isError = require('lodash/isError')
const onAuthEvent = require('../../../../lib/ws2/events/auth')

const defaultState = {
  channels: {},
  emit: () => {}
}

const authSuccessPacket = {
  chanId: 0,
  msg: 'successfully authenticated',
  status: 'OK'
}

const authErrorPacket = {
  chanId: 0,
  msg: 'authentication error',
  status: 'ERROR'
}

describe('ws2:events:auth', () => {
  it('emits auth event', (done) => {
    onAuthEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:auth') {
          assert.deepStrictEqual(packet, authSuccessPacket)
          done()
        }
      }
    }, authSuccessPacket)
  })

  it('emits error event if auth failed', (done) => {
    onAuthEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'error') {
          assert(_isError(data))
          done()
        }
      }
    }, authErrorPacket)
  })

  it('emits auth error event if auth failed', (done) => {
    onAuthEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:auth:error') {
          assert.deepStrictEqual(packet, authErrorPacket)
          done()
        }
      }
    }, authErrorPacket)
  })

  it('emits auth success event if auth succeeded', (done) => {
    onAuthEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:auth:success') {
          assert.deepStrictEqual(packet, authSuccessPacket)
          done()
        }
      }
    }, authSuccessPacket)
  })

  it('sets authenticated flag and auth channel if auth succeeded', () => {
    const nextState = onAuthEvent(defaultState, authSuccessPacket)

    assert(nextState.authenticated)
    assert(nextState.channels[0])
    assert.deepStrictEqual(nextState.channels[0], { channel: 'auth' })
  })
})
