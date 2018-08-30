'use strict'

module.exports = {
  authWS: require('./auth'),
  reopenWS: require('./reopen'),
  openWS: require('./open'),

  subscribeWS: require('./subscribe'),
  unsubscribeWS: require('./unsubscribe'),
  sendWS: require('./send'),

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
