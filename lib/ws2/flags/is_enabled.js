'use strict'

/**
 * @param {Object} state
 * @param {number} flag
 * @return {boolean} enabled
 */
const isFlagEnabled = (state = {}, flag) => {
  const { flags } = state
  return (flags & flag) === flag
}

module.exports = isFlagEnabled
