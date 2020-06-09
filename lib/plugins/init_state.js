'use strict'

/**
 * @param {Plugin} plugin - plugin
 * @returns {object} state
 */
const initPluginState = (plugin = {}) => {
  return {
    ...(plugin.initialState || {})
  }
}

module.exports = initPluginState
