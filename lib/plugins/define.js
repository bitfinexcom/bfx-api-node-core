'use strict'

const emitEvent = require('./emit_event')
const getState = require('./get_state')

/**
 * Provides helpers for the plugin definition, and attaches the ID
 *
 * @param {string} id - plugin ID
 * @param {object} defaultArgs - default plugin arguments
 * @param {Function} cb - plugin def function
 * @returns {PluginGenerator} def - enriched plugin
 *   def function
 */
const definePlugin = (id, defaultArgs, cb = () => {}) => {
  const helpers = {
    emit: emitEvent.bind(null, id),
    getState: getState.bind(null, id)
  }

  const defFunc = (pluginArgs = {}) => {
    const def = cb(helpers, {
      ...defaultArgs,
      ...pluginArgs
    })

    return {
      ...def,
      id
    }
  }

  defFunc.id = id
  return defFunc
}

module.exports = definePlugin
