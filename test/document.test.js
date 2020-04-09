const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const db = require('../database/models')
const {projects, addProjects, cleanProjects, addLiquidityTypes} = require('./project.test')
const {financialSources, addFinancialSources, cleanFinancialSource} = require('./financial_source.test')
const moment = require('moment')
const LiquidityParentType = require('../enum/liquidity_parent_type')
const lodash = require('lodash')

const documents = [{
  id: null,
  projectId: null,
  financialSourceId: null,
  humanReadableId: 'ABCD',
  abstract: '个人使用',
  liquidityTypeId: null,
  liquidityType: projects[0].liquidityParentTypes[0],
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
  liquidityType: projects[0].liquidityParentTypes[1],
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
    }).expect(201)
    documents[i].id = body.id
  }
}

const cleanDocuments = async function() {
  return db.documentSummary.destroy({where: {}})
  return db.document.destroy({where: {}})
}

describe('document', async function() {
  beforeEach(async function() {
    await cleanProjects()
    await cleanFinancialSource()
    await cleanDocuments()
    await addProjects()
    await addLiquidityTypes()
    await addFinancialSources()
    await addDocuments()
  })

  afterEach(async function() {
    await cleanProjects()
    await cleanFinancialSource()
    await cleanDocuments()
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

  describe('financial monthly statistics', async function() {
    beforeEach(async function() {
      // await addDocuments()
    })

    afterEach(async function() {
      // await cleanDocuments()
    })

    const validFinancialMonthlyStatistics = function(financialMonthlyStatistics) {
      assert.equal(financialMonthlyStatistics.length, financialSources.length)
      for (const fs of financialSources) {
        const fms = financialMonthlyStatistics.find((_) => _.id === fs.id)
        assert.notEqual(fms, undefined)
        assert.notEqual(fms.monthlyStatistics, undefined)
        const incomeDocuments = documents.filter(
            (document) => document.financialSourceId === fs.id && document.liquidityType.parentType === LiquidityParentType.INCOME
        )
        const expenseDocuments = documents.filter(
            (document) => document.financialSourceId === fs.id && document.liquidityType.parentType === LiquidityParentType.EXPENSE
        )
        assert.equal(fms.monthlyStatistics.income, lodash.sumBy(incomeDocuments, 'amount'))
        assert.equal(fms.monthlyStatistics.expense, lodash.sumBy(expenseDocuments, 'amount'))
        assert.equal(fms.monthlyStatistics.monthlyCarryoverAmount, fs.initialStock)
        assert.equal(fms.monthlyStatistics.balance, fs.initialStock + fms.monthlyStatistics.income - fms.monthlyStatistics.expense)
      }
    }

    it('can be got', async function() {
      assert.notEqual(documents.length, 0)
      const {generatedAt} = documents[0]
      const queryDate = moment(generatedAt)
      const {body} = await request(app).get(`/financial-monthly-summary?month=${queryDate.get('month')}&year=${queryDate.get('year')}`).expect(200)
      validFinancialMonthlyStatistics(body)

      documents[0].liquidityType = documents[1].liquidityType
      documents[0].liquidityTypeId = documents[1].liquidityTypeId
      documents[0].projectId = documents[1].projectId
      documents[0].financialSourceId = documents[1].financialSourceId
      documents[0].amount = 1
      await request(app).put(`/documents/${documents[0].id}`).send({
        financialSourceId: documents[0].financialSourceId,
        liquidityTypeId: documents[0].liquidityTypeId,
        amount: documents[0].amount,
        projectId: documents[0].projectId
      }).expect(200)
      await request(app).delete(`/documents/${documents[1].id}`).expect(204)
      delete documents[1]
      const {body: body2} = await request(app).get(`/financial-monthly-summary?month=${queryDate.get('month')}&year=${queryDate.get('year')}`).expect(200)
      validFinancialMonthlyStatistics(body2)

      await request(app).delete(`/documents/${documents[0].id}`).expect(204)
      delete documents[0]
      const {body: body3} = await request(app).get(`/financial-monthly-summary?month=${queryDate.get('month')}&year=${queryDate.get('year')}`).expect(200)
      validFinancialMonthlyStatistics(body3)
    })
  })
})

module.exports = {
  addDocuments,
  documents,
  cleanDocuments
}
