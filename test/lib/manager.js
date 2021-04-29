/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { createSandbox, assert } = require('sinon')
const proxyquire = require('proxyquire')

const { delay } = require('../utils')

const sandbox = createSandbox()
const renewAuthTokenStub = sandbox.stub()
const RESTv2ConstructorStub = sandbox.stub()

const Manager = proxyquire('../../lib/manager', {
  './manager/auth': {
    renewAuthToken: renewAuthTokenStub
  },
  'bfx-api-node-rest': {
    RESTv2: sandbox.spy((opts) => {
      RESTv2ConstructorStub(opts)
      return {}
    })
  }
})

describe('manager', () => {
  after(() => {
    sandbox.restore()
  })

  describe('auto-renew auth token', () => {
    const args = {
      apiKey: 'api key',
      apiSecret: 'api secret',
      authToken: 'auth token',
      userId: 'user id',
      authTokenExpiresAt: '100',
      authURL: 'auth url',
      transform: 'transform',
      agent: 'agent',
      restURL: 'rest url'
    }

    it('immediately renew token if expiresAt is not provided', async () => {
      const newToken = {
        token: 'new token',
        expiresAt: 100
      }
      sandbox.stub(Date, 'now').returns(0)
      renewAuthTokenStub.resolves(newToken)

      const instance = new Manager({
        ...args,
        authTokenExpiresAt: undefined
      })
      await delay(100)

      assert.calledWithExactly(renewAuthTokenStub, {
        authURL: args.authURL,
        userId: args.userId,
        authToken: args.authToken
      })
      assert.calledWithExactly(RESTv2ConstructorStub.firstCall, {
        apiKey: args.apiKey,
        apiSecret: args.apiSecret,
        authToken: args.authToken,
        transform: args.transform,
        agent: args.agent,
        url: args.restURL
      })
      assert.calledWithExactly(RESTv2ConstructorStub.secondCall, {
        apiKey: args.apiKey,
        apiSecret: args.apiSecret,
        authToken: newToken.token,
        transform: args.transform,
        agent: args.agent,
        url: args.restURL
      })
      expect(instance.authToken).to.eq(newToken.token)
      expect(instance.authTokenExpiresAt).to.eq(newToken.expiresAt)
    })
  })
})
