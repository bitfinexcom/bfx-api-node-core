'use strict'

const Manager = require('./lib/manager')
const Config = require('./lib/config')
const flags = require('./lib/ws2/flags')
const plugins = require('./lib/plugins')
const ws2 = require('./lib/ws2')

module.exports = {
  Manager,
  Config,

  ...plugins,
  ...flags,
  ...ws2
}
