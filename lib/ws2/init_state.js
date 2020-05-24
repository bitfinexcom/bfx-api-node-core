'use strict'

const _mapValues = require('lodash/mapValues')
const { nonce } = require('bfx-api-node-util')

const initPluginState = require('../plugins/init_state')
const { WS_URL } = require('../config')
const open = require('./open')

/**
 * Creates & opens a WSv2 API connection, and returns the resulting state object
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {object} opts
 * @param {string} [opts.url='wss://api.bitfinex.com/ws/2'] - endpoint
 * @param {object} [opts.agent] - connection agent
 * @param {boolean} [opts.transform] - if true, raw API data arrays will be
 *   automatically converted to bfx-api-node-models instances
 * @param {string} [opts.apiKey] - for later authentication
 * @param {string} [opts.apiSecret] - for later authentication
 * @param {object} [opts.plugins] - optional set of plugins to use with the
 *   connection
 * @returns {module:bfx-api-node-core.SocketState} state
 */
const initState = (opts = {}) => {
  const {
    agent,
    apiKey,
    apiSecret,
    plugins = {},
    transform,
    url = WS_URL
  } = opts

  const { ev, ws } = open(url, agent)
  const emit = (type, ...args) => { // queue emit on end of call chain
    setTimeout(() => {
      ev.emit(type, ...args)
    }, 0)
  }

  return {
    channels: {},
    pendingSubscriptions: [],
    pendingUnsubscriptions: [],
    plugins: _mapValues(plugins, initPluginState),
    id: nonce(),
    isOpen: false,
    sendBuffer: [],

    apiKey,
    apiSecret,
    transform,
    agent,
    emit,
    url,
    ev,
    ws
  }
}

module.exports = initState
