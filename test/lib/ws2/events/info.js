/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isError = require('lodash/isError')
const onInfoEvent = require('../../../../lib/ws2/events/info')
const Config = require('../../../../lib/config')

const defaultState = {
  emit: () => {},
  ws: {
    close: () => {}
  }
}

describe('ws2:events:info', () => {
  it('emits info event', (done) => {
    const testPacket = { test: 42 }

    onInfoEvent({
      ...defaultState,
      emit: (eventName, packet) => {
        if (eventName === 'event:info') {
          assert.deepStrictEqual(packet, testPacket)
          done()
        }
      }
    }, testPacket)
  })

  it('emits an error on API server version miss-match and closes the connection', () => {
    const versionErrorPacket = { version: 1 }
    let sawError = false
    let closedConnection = false

    onInfoEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'error') {
          assert(_isError(data))
          sawError = true
        }
      },

      ws: {
        close: () => {
          closedConnection = true
        }
      }
    }, versionErrorPacket)

    assert(sawError)
    assert(closedConnection)
  })

  it('emits server-restart event on associated info packet', (done) => {
    const packet = {
      code: Config.INFO_CODES.SERVER_RESTART
    }

    onInfoEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'event:info:server-restart') {
          assert.deepStrictEqual(data, packet)
          done()
        }
      }
    }, packet)
  })

  it('emits maintenance-start event on associated info packet', (done) => {
    const packet = {
      code: Config.INFO_CODES.MAINTENANCE_START
    }

    onInfoEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'event:info:maintenance-start') {
          assert.deepStrictEqual(data, packet)
          done()
        }
      }
    }, packet)
  })

  it('emits maintenance-end event on associated info packet', (done) => {
    const packet = {
      code: Config.INFO_CODES.MAINTENANCE_END
    }

    onInfoEvent({
      ...defaultState,
      emit: (eventName, data) => {
        if (eventName === 'event:info:maintenance-end') {
          assert.deepStrictEqual(data, packet)
          done()
        }
      }
    }, packet)
  })
})
