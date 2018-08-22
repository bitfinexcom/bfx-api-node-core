'use strict'

const _mapValues = require('lodash/mapValues')
const { nonce } = require('bfx-api-node-util')

const initPluginState = require('../plugins/init_state')
const { WS_URL } = require('../config')
const open = require('./open')

module.exports = (opts = {}) => {
  const {
    agent,
    apiKey,
    apiSecret,
    plugins = {},
    transform = false,
    url = WS_URL,
  } = opts

  const { ev, ws } = open(url, agent)

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
    url,
    ev,
    ws,
  }
}
