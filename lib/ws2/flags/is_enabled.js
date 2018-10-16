'use strict'

/**
 * @param {Object} state
 * @param {number} flag
 * @return {boolean} enabled
 */
module.exports = (state = {}, flag) => {
  const { flags } = state
  return (flags & flag) === flag
}
