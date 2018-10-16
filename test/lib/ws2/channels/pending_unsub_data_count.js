/* eslint-env mocha */
'use strict'

const assert = require('assert')
const pendingUnsubDataCount = require('ws2/channels/pending_unsub_data_count')

describe('ws2:channels:pending_unsub_data_count', () => {
  it('returns the number of pending data unsubscriptions', () => {
    const count = pendingUnsubDataCount({
      pendingUnsubscriptions: [42, 41],
      channels: {
        0: { channel: 'auth' },
        42: { channel: 'ticker' },
        41: { channel: 'random' }
      }
    })

    assert.equal(count, 1)
  })
})
