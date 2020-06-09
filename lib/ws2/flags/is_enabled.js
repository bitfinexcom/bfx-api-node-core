'use strict'

/**
 * Query if a flag is enabled on the provided socket.
 *
 *
 * @param {SocketState} state - socket
 * @param {number} flag - flag
 * @returns {boolean} enabled
 */
const isFlagEnabled = (state = {}, flag) => {
  const { flags } = state
  return (flags & flag) === flag
}

module.exports = isFlagEnabled
