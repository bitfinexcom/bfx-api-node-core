'use strict'

const _find = require('lodash/find')
const _isArray = require('lodash/isArray')
const _isObject = require('lodash/isObject')

/**
 * Resolves the message payload; useful for getting around sequence numbers
 *
 * @param {*[]} msg
 * @return {Array} payload - undefined if not found
 */
module.exports = (msg = []) => {
  return _find(msg, i => _isArray(i) || _isObject(i))
}
