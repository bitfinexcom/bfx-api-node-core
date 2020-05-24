'use strict'

/**
 * @param {object} plugin
 * @returns {object} state
 */
module.exports = (plugin = {}) => {
  return {
    ...(plugin.initialState || {})
  }
}
