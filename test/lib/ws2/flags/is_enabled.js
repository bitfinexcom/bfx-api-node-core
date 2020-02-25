/* eslint-env mocha */
'use strict'

const assert = require('assert')
const isFlagEnabled = require('../../../../lib/ws2/flags/is_enabled')
const Config = require('../../../../lib/config')

const state = {
  flags: Config.FLAGS.SEQ_ALL + Config.FLAGS.OB_CHECKSUM
}

describe('ws2:flags:is-enabled', () => {
  it('correctly detects flags', () => {
    assert(isFlagEnabled(state, Config.FLAGS.SEQ_ALL))
    assert(isFlagEnabled(state, Config.FLAGS.OB_CHECKSUM))
    assert(!isFlagEnabled(state, Config.FLAGS.TIME_S))
  })
})
