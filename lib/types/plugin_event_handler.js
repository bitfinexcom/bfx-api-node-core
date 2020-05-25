'use strict'

/**
 * A plugin event handler function.
 *
 * @callback module:bfx-api-node-core.PluginEventHandler
 *
 * @param {object} args - arguments
 * @param {module:bfx-api-node-core.SocketState} args.state - target socket
 * @returns {Array|null} stateUpdate - of the form `[socketState, pluginState]`
 */
