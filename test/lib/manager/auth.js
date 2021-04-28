/* eslint-env mocha */
'use strict'

const proxyquire = require('proxyquire')
const { assert, createSandbox } = require('sinon')
const { expect } = require('chai')

const sandbox = createSandbox()
const stubFetch = sandbox.stub()

const auth = proxyquire('../../../lib/manager/auth', {
  'node-fetch': stubFetch
})

describe('manager auth', () => {
  after(() => {
    sandbox.restore()
  })

  describe('renewAuthToken', () => {
    const authURL = 'auth url'
    const userId = 'user id'
    const authToken = 'old token'
    const fakeResponse = {
      message: 'User auth token created successfully.',
      data: {
        userId: 'user id',
        token: 'new token',
        renewedAt: 1619611815,
        expiresAt: 1619698215
      }
    }

    it('should renew auth token via auth api', async () => {
      const stubJson = sandbox.stub().resolves(fakeResponse)
      stubFetch.resolves({ json: stubJson })

      const data = await auth.renewAuthToken({ authURL, userId, authToken })

      assert.calledWithExactly(
        stubFetch,
        'auth url/v1/user/auth',
        { method: 'POST', body: '{"userId":"user id","token":"old token"}' }
      )
      assert.calledOnce(stubJson)
      expect(data).to.eql(fakeResponse.data)
    })
  })
})
