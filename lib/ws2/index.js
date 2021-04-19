'use strict'

module.exports = {
  auth: require('./auth'),
  reopen: require('./reopen'),
  open: require('./open'),

  subscribe: require('./subscribe'),
  unsubscribe: require('./unsubscribe'),
  send: require('./send'),

  ping: require('./ping'),

  initWSState: require('./init_state'),
  findChannelId: require('./find_channel_id'),

  submitOrderWithDelay: require('./orders/submit_with_delay'),
  submitOrder: require('./orders/submit'),
  updateOrder: require('./orders/update'),
  cancelOrder: require('./orders/cancel'),
  cancelOrderWithDelay: require('./orders/cancel_with_delay'),

  setFlag: require('./flags/set'),
  enableFlag: require('./flags/enable'),
  disableFlag: require('./flags/disable'),
  isFlagEnabled: require('./flags/is_enabled')
}
