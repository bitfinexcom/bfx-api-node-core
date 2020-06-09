'use strict'

/**
 * Get plugin state by ID from a socket
 *
 * @param {string} id - unique plugin ID
 * @param {SocketState} wsState - socket
 * @returns {Plugin} plugin - may be undefined
 */
const getPluginState = (id, wsState = {}) => {
  const { plugins = {} } = wsState
  return plugins[id]
}

module.exports = getPluginState
