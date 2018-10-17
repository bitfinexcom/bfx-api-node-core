'use strict'

/**
 * Notifies the plugin on the 'self' section with the specified event
 *
 * @param {Manager} m
 * @param {number} wsID - websocket ID
 * @param {string} pluginID - ID of plugin to notify
 * @param {string} label - name of event to trigger
 * @param {Object} args - event arguments
 */
module.exports = (m, wsID, pluginID, label, args) => {
  const plugin = m.plugins[pluginID]

  if (plugin) {
    m.notifyPlugin(plugin, 'self', label, args)
  }
}
