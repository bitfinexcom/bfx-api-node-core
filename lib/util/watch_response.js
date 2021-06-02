'use strict'

const Promise = require('bluebird')

/**
 * The method watches the response via events and provides
 * memory-safe removing of listeners in case of timeout or failure.
 *
 * @param {EventEmitter} ev
 * @param {string} successEvent - success event name
 * @param {string} failureEvent - failure event name
 * @param {number?} timeout - timeout in milliseconds
 * @return {Promise}
 */
module.exports = (ev, successEvent, failureEvent, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    const onSuccess = (...args) => {
      clear()
      resolve(args)
    }
    const onFailure = (error) => {
      clear()
      reject(error)
    }
    const clear = () => {
      ev.off(successEvent, onSuccess)
      ev.off(failureEvent, onFailure)
      clearTimeout(timeoutId)
    }
    const timeoutId = setTimeout(() => {
      clear()
      reject(new Error(`Response timeout for ${successEvent} and ${failureEvent}`))
    }, timeout)

    ev.once(successEvent, onSuccess)
    ev.once(failureEvent, onFailure)
  })
}
