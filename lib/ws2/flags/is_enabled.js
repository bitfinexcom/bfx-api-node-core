'use strict'

module.exports = (state = {}, flag) => {
  const { flags } = state
  return (flags & flag) === flag
}
