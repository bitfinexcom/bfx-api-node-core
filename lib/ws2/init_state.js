'use strict'

const _mapValues = require('lodash/mapValues')

const initPluginState = require('../plugins/init_state')
const { WS_URL } = require('../config')
const open = require('./open')
const id = require('../id')

module.exports = (opts = {}, url = WS_URL, agent) => {
  const { transform = false, plugins = {} } = opts
  const { ev, ws } = open(url, agent)

  return {
    plugins: _mapValues(plugins, initPluginState),
    channels: {},
    id: id(),

    transform,
    agent,
    url,
    ev,
    ws,
  }
}
