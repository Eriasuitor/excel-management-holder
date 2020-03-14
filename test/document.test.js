const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const db = require('../database/models')
const {projects, addProjects, cleanProjects, addLiquidityTypes} = require('./project.test')
const {financialSources, addFinancialSources, cleanFinancialSource} = require('./financial_source.test')

const documents = [{
  id: null,
  projectId: null,
  financialSourceId: null,
  humanReadableId: 'ABCD',
  abstract: '个人使用',
  liquidityTypeId: null,
  amount: 100,
  generatedAt: '2020/03/04',
  handler: 'Mr. Jone',
  remark: '没事'
}, {
  id: null,
  projectId: null,
  financialSourceId: null,
  humanReadableId: 'ABCD',
  abstract: '个人使用',
  liquidityTypeId: null,
  amount: 100,
  generatedAt: '2020/03/04',
  handler: 'Mr. Jone',
  remark: '有事'
}]

const addDocuments = async function() {
  for (let i = 0; i < documents.length; i++) {
    documents[i].projectId = projects[0].id
    documents[i].financialSourceId = financialSources[i].id
    documents[i].liquidityTypeId = projects[0].liquidityParentTypes[i].id
    const {projectId, financialSourceId, humanReadableId, abstract, liquidityTypeId, amount, generatedAt, handler, remark} = documents[i]
    const {body} = await request(app).post(`/documents`).send({
      projectId, financialSourceId, humanReadableId, abstract, liquidityTypeId, amount, generatedAt, handler, remark
    })
    documents[i].id = body.id
  }
}

describe('document', async function() {
  beforeEach(async function() {
    await cleanProjects()
    await cleanFinancialSource()
    await addProjects()
    await addLiquidityTypes()
    await addFinancialSources()
    await addDocuments()
  })

  it('can add', async function() {
    assert.equal(await db.document.count(), 2)
  })

  it('can updated', async function() {
    documents[0].amount = 1001
    await request(app).put(`/documents/${documents[0].id}`).send({
      amount: documents[0].amount
    }).expect(200)
    const updated = await db.document.findByPk(documents[0].id)
    assert.notEqual(updated, null)
    assert.equal(updated.amount, documents[0].amount)
  })

  it('can delete', async function() {
    await request(app).delete(`/documents/${documents[0].id}`).expect(204)
    const updated = await db.document.findByPk(documents[0].id)
    assert.equal(updated, null)
  })

  it('can query', async function() {
    const {body: {count, rows}} = await request(app).get('/documents?pageSize=1').expect(200)
    assert.equal(count, 2)
    assert.equal(rows.length, 1)
  })
})
