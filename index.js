'use strict'

const Manager = require('./lib/manager')
const Config = require('./lib/config')
const flags = require('./lib/ws2/flags')

module.exports = {
  Manager,
  Config,

  ...flags,
}
