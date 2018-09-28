'use strict'

const emitEvent = require('./emit_event')
const getState = require('./get_state')

/**
 * Provides helpers for the plugin definition, and attaches the ID
 *
 * @param {string} id
 * @param {Object} defaultArgs
 * @param {Function} cb - plugin def function
 * @return {Function} def - enriched plugin def function
 */
module.exports = (id, defaultArgs, cb = () => {}) => {
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
