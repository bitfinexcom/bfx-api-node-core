'use strict'

const _find = require('lodash/find')
const _isArray = require('lodash/isArray')
const _isObject = require('lodash/isObject')

/**
 * Resolves the message payload; useful for getting around sequence numbers
 *
 * @private
 *
 * @param {Array} msg - message
 * @returns {Array} payload - undefined if not found
 */
const msgPayload = (msg = []) => {
  return _find(msg, i => _isArray(i) || _isObject(i)) // eslint-disable-line
}

module.exports = msgPayload
