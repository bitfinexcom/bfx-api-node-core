'use strict'

/**
 * Notifies about an incoming websocket data packet (candles, trades, etc)
 *
 * @param {Manager} m
 * @param {number} wsID
 * @param {string} type - i.e. candles, trades, etc
 * @param {Object} data - incoming data packet
 * @param {Object} data.chanFilter - channel data (symbol, prec, len, etc)
 * @param {Object} data.original - array-format data as received from ws2
 * @param {Object} data.requested - original or transformed data, based on transform flag
 */
module.exports = (m, wsID, type, data) => {
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
