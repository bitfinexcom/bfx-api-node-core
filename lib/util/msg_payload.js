'use strict'

const _findLast = require('lodash/findLast')
const _isArray = require('lodash/isArray')
const _isObject = require('lodash/isObject')

/**
 * Resolves the message payload; useful for getting around sequence numbers
 *
 * @param {*[]} msg
 * @return {Array} payload - undefined if not found
 */
module.exports = (msg = []) => {
  return _findLast(msg, i => _isArray(i) || _isObject(i))
}
