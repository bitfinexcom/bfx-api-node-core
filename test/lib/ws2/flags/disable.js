/* eslint-env mocha */
'use strict'

const assert = require('assert')
const disableFlag = require('ws2/flags/disable')

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

describe('ws2:flags:disable', () => {
  it('sets flags to new flag set after removing single flag', () => {
    const nextState = disableFlag({
      ...defaultState,
      flags: 42
    }, 42, true)

    assert.strictEqual(nextState.flags, 0)
  })
})
