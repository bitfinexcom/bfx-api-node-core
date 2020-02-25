/* eslint-env mocha */
'use strict'

const assert = require('assert')
const wsClose = require('../../../../lib/manager/events/ws_close')

describe('manager:events:ws_close', () => {
  it('emits selected ws id when ws found in wsPool', () => {
    const wsId = 1000
    const manager = {
      getWS: () => {},
      notifyPlugins: (arg1, arg2, arg3, payload) => {
        assert.strictEqual(payload.id === wsId)
      },
      emit: (eventName, payload) => assert.strictEqual(payload.id, wsId)
    }

    wsClose(manager, manager.id)
  })

  it('returns when ws not found in wsPool', () => {
    const manager = {
      getWS: () => undefined,
      emit: () => assert.fail()
    }

    const wsCloseReturnValue = wsClose(manager, manager.id)
    assert.strictEqual(wsCloseReturnValue, undefined)
  })
})
