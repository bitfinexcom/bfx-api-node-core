'use strict'

/**
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.Plugin} plugin
 * @returns {object} state
 */
const initPluginState = (plugin = {}) => {
  return {
    ...(plugin.initialState || {})
  }
}

module.exports = initPluginState
