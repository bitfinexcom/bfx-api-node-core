'use strict'

process.env.DEBUG = '*'

const debug = require('debug')('bfx:api:core:examples:cancel_order_by_gid')
const { Manager, cancelOrdersByGid } = require('../')

debug('opening connection...')

const gid = 1622459132273

const m = new Manager({
  apiKey: 'api key',
  apiSecret: 'api secret',
  transform: true
})

const wsState = m.openWS()

m.on('ws2:open', () => debug('connection opened'))
m.on('ws2:close', () => debug('connection closed'))

m.on('ws2:event:auth:success', (packet) => {
  cancelOrdersByGid(wsState, { gid })
    .then(console.log)
    .catch(console.error)
})
