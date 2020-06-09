'use strict'

/**
 * Notifies about an incoming websocket data packet (candles, trades, etc)
 *
 * @private
 *
 * @param {Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {string} type - i.e. candles, trades, etc
 * @param {object} data - incoming data packet
 * @param {object} data.chanFilter - channel data (symbol, prec, len, etc)
 * @param {object} data.original - array-format data as received from ws2
 * @param {object} data.requested - original or transformed data, based on transform flag
 */
const onWSDataEvent = (m, wsID, type, data) => {
  const { requested, chanFilter, original } = data

  m.notifyPlugins('ws2', 'data', type, {
    id: wsID,
    data
  })

  m.emit(`ws2:${type}`, requested, {
    original,
    chanFilter,
    id: wsID
  })
}

module.exports = onWSDataEvent
