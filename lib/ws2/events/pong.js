'use strict'

module.exports = (state = {}, msg) => {
  const { emit } = state
  const { cid } = msg

  emit('event:pong', msg)
  emit(`event:pong:${cid}`, msg)

  return null
}
