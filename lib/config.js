'use strict'

module.exports = {
  REST_URL: 'https://api.bitfinex.com',
  WS_URL: 'wss://api.bitfinex.com/ws/2',
  AUTH_URL: 'http://localhost:5050',
  DUST: 0.0000001,

  INFO_CODES: {
    SERVER_RESTART: 20051,
    MAINTENANCE_START: 20060,
    MAINTENANCE_END: 20061
  },

  FLAGS: {
    DEC_S: 8, // enables all decimals as strings
    TIME_S: 32, // enables all timestamps as strings
    TIMESTAMP: 32768, // timestamps in milliseconds
    SEQ_ALL: 65536, // enable sequencing
    OB_CHECKSUM: 131072 // enable checksum per OB change, top 25 levels per-side
  }
}
