'use strict'

/**
 * Get plugin state by ID from a socket
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {string} id - unique plugin ID
 * @param {module:bfx-api-node-core.SocketState} wsState - socket
 * @returns {module:bfx-api-node-core.Plugin} plugin - may be undefined
 */
const getPluginState = (id, wsState = {}) => {
  const { plugins = {} } = wsState
  return plugins[id]
}

module.exports = getPluginState
