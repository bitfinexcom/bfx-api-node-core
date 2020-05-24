'use strict'

/**
 * Notifies the plugin on the 'self' section with the specified event
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.Manager} m - manager
 * @param {number} wsID - websocket ID
 * @param {string} pluginID - ID of plugin to notify
 * @param {string} label - name of event to trigger
 * @param {object} args - event arguments
 */
const onPluginEvent = (m, wsID, pluginID, label, args) => {
  const plugin = m.plugins[pluginID]

  if (plugin) {
    m.notifyPlugin(plugin, 'self', label, args)
  }
}

module.exports = onPluginEvent
