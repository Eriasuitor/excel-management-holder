const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const fs = require('fs')
const {addDocuments, cleanDocuments} = require('./document.test')

describe('export', async function() {
  beforeEach(async function() {
    await addDocuments()
  })

  afterEach(async function() {
    await cleanDocuments()
  })

  it('can be created', async function() {
    const reqBody = {
      filename: '测试',
      worksheets: [{
        type: 'annualFinance',
        year: 2020
      }, {
        type: 'annualProject',
        year: 2020
      }]
    }
    const res = request(app).post('/exports').send(reqBody).expect(200)
    const promise = new Promise((resolve) => res.on('end', resolve))
    res.pipe(fs.createWriteStream(`${reqBody.filename}.xlsx`))
    await promise
  })
})
