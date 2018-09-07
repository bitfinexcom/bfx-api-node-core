'use strict'

/**
 * @param {Object} plugin
 * @return {Object} state
 */
module.exports = (plugin = {}) => {
  return {
    ...(plugin.initialState || {})
  }
}
