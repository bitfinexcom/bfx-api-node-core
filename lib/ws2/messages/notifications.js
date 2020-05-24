'use strict'

const debug = require('debug')('bfx:api:ws:messages:notifications')
const { Notification } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')

const getMsgPayload = require('../../util/msg_payload')

const idIndex = {
  'on-req': 2,
  'ou-req': 0,
  'oc-req': 0
}

/**
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {object} args - args
 * @returns {object|null} nextState
 */
const onWSNotificationsMessage = (args = {}) => {
  const { state = {}, msg = [] } = args
  const { emit, transform } = state
  const data = getMsgPayload(msg)
  const [, type,,, payload,, status, message] = data

  if (status || message) {
    debug('%s: %s', status, message)
  }

  emit('data:notification', {
    msg,
    original: data,
    requested: transform
      ? new Notification(data)
      : data
  })

  if (payload && _isFinite(idIndex[type])) {
    const eid = payload[idIndex[type]]
    const nData = transform
      ? new Notification(data)
      : payload

    emit(`n:${type}:${eid}:${status.toLowerCase()}`, nData, payload)
  }

  return null
}

module.exports = onWSNotificationsMessage
