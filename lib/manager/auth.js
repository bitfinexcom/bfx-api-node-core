'use strict'

const fetch = require('node-fetch')

const { AUTH_URL } = require('../config')

/**
 * TODO
 *
 * @param {Object} args
 * @param {string?} args.authURL
 * @param {string} args.userId
 * @param {string} args.authToken
 * @returns {Promise<*>}
 */
const renewAuthToken = async ({ authURL, userId, authToken } = {}) => {
  const baseUrl = authURL || AUTH_URL
  const url = `${baseUrl}/v1/user/auth`
  const options = {
    method: 'POST',
    body: JSON.stringify({
      userId: userId,
      token: authToken
    })
  }
  const request = await fetch(url, options)
  const { data } = await request.json()
  return data
}

module.exports = {
  renewAuthToken
}
