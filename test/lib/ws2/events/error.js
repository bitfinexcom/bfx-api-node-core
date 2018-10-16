/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onErrorEvent = require('ws2/events/error')

const defaultState = {
  emit: () => {}
}

describe('ws2:events:error', () => {
  it('emits error event', (done) => {
    const err = new Error()

    onErrorEvent({
      ...defaultState,
      emit: (eventName, error) => {
        if (eventName === 'event:error') {
          assert.equal(error, err)
          done()
        }
      }
    }, err)
  })

  it('emits generic error event', (done) => {
    const err = new Error()

    onErrorEvent({
      ...defaultState,
      emit: (eventName, error) => {
        if (eventName === 'error') {
          assert.equal(error, err)
          done()
        }
      }
    }, err)
  })
})
