'use strict'

/**
 * A plugin event handler function.
 *
 * @callback PluginEventHandler
 *
 * @param {object} args - arguments
 * @param {SocketState} args.state - target socket
 * @returns {Array|null} stateUpdate - of the form `[socketState, pluginState]`
 */
