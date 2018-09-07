'use strict'

module.exports = (id, wsState = {}) => {
  const { plugins = {} } = wsState
  return plugins[id]
}
