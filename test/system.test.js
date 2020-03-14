const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const NodeEnv = require('../enum/nodeEnv')

describe('system', async function() {
  it('can ge info', async function() {
    const {body: systemInfo} = await request(app).get('/system/info').expect(200)
    assert.equal(systemInfo.env, NodeEnv.Test)
  })
})
