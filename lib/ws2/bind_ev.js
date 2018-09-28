'use strict'

module.exports = (state = {}) => {
  const { ws, ev } = state

  ws.on('open', () => {
    ev.emit('self:open')
  })

  ws.on('message', (msg, flags) => {
    ev.emit('self:message', msg, flags)
  })

  ws.on('error', (err) => {
    ev.emit('self:error', err)
  })

  ws.on('close', () => {
    ev.emit('self:close')
  })
}
