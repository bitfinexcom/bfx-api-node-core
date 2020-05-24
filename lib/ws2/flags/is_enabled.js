'use strict'

/**
 * @param {object} state
 * @param {number} flag
 * @returns {boolean} enabled
 */
const isFlagEnabled = (state = {}, flag) => {
  const { flags } = state
  return (flags & flag) === flag
}

module.exports = isFlagEnabled
