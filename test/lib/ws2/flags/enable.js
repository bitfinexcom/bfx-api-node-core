/* eslint-env mocha */
'use strict'

const assert = require('assert')
const enableFlag = require('ws2/flags/enable')

const defaultState = {
  flags: 0,
  isOpen: true,
  ws: {
    send: () => {}
  },
  ev: {
    emit: () => {}
  }
}

describe('ws2:flags:enable', () => {
  it('sets flags to new flag set after adding single flag', () => {
    const nextState = enableFlag({ ...defaultState }, 42, true)
    assert.strictEqual(nextState.flags, 42)
  })
})
