'use strict'

module.exports = (state = {}, comp = () => false) => {
  const { channels = {} } = state

  return Object.keys(channels).find(cId => {
    return comp(channels[cId])
  })
}
