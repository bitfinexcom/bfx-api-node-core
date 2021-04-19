'use strict'

process.env.DEBUG = '*'

const debug = require('debug')('bfx:api:core:examples:ping')
const { Manager, ping } = require('../')

debug('opening connection...')

const m = new Manager({ transform: true })
const wsState = m.openWS()

m.on('ws2:open', () => debug('connection opened'))
m.on('ws2:close', () => debug('connection closed'))

m.on('ws2:event:pong', (msg) => {
  console.log('ws2:event:pong', msg)
})

ping(wsState, { cid: 12345 }).then(console.log)
