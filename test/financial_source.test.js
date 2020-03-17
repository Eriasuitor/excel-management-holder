const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const db = require('../database/models')

const financialSources = [{
  name: '711',
  desc: '建行',
  financialSourceTrackers: [{
    financialSourceId: null,
    year: 2020,
    month: 1,
    monthlyCarryoverAmount: 1000,
    income: 200,
    expense: 300,
    balance: 400
  }, {
    financialSourceId: null,
    year: 2020,
    month: 2,
    monthlyCarryoverAmount: 1000,
    income: 200,
    expense: 300,
    balance: 400
  }]
}, {
  name: '999',
  desc: '工行',
  financialSourceTrackers: []
}]

const addFinancialSources = async function() {
  for (let i = 0; i < financialSources.length; i++) {
    const financialSource = financialSources[i]
    await request(app).post('/financial-sources').send({
      name: financialSource.name,
      desc: financialSource.desc
    }).expect(201)
  }
  for (let i = 0; i < financialSources.length; i++) {
    const financialSource = financialSources[i]
    await request(app).post('/financial-sources').send({
      name: financialSource.name,
      desc: financialSource.desc
    }).expect(409)
    const created = await db.financialSource.findOne({
      where: {name: financialSources[i].name},
      raw: true,
      attributes: ['id']
    })
    financialSources[i].id = created.id
  }
}

const cleanFinancialSource = async function() {
  return db.financialSource.destroy({where: {}})
}

describe('financial source', async function() {
  beforeEach(async function() {
    await db.financialSourceTracker.destroy({where: {}})
    await db.sequelize.query(`
     DELETE FROM financialSources;
    `)
  })

  it('can add financialSource', async function() {
    await addFinancialSources()
  })

  it('can update financialSource', async function() {
    await addFinancialSources()
    const financialSource = financialSources[0]
    financialSource.name = '1000'
    await request(app).put(`/financial-sources/${financialSource.id}`).send({
      name: financialSource.name
    }).expect(200)
    const updated = await db.financialSource.findByPk(financialSource.id, {raw: true})
    assert.equal(updated.name, financialSource.name)

    await request(app).put(`/financial-sources/${financialSources[1].id}`).send({
      name: financialSources[0].name
    }).expect(409)
    await request(app).put(`/financial-sources/${financialSources[1].id}`).send({
      name: financialSources[1].name
    }).expect(200)
  })

  const removeFinancialSource = async function(id) {
    return request(app).delete(`/financial-sources/${id}`).send().expect(204)
  }
  it('can delete financialSource', async function() {
    await addFinancialSources()
    await removeFinancialSource(financialSources[0].id)
    const financialSource = await db.financialSource.findByPk(financialSources[0].id)
    assert.equal(financialSource, null)
    const [[financialSource2]] = await db.sequelize.query(`
      SELECT * FROM financialSources WHERE id = ${financialSources[0].id}
    `)
    assert.equal(financialSource2.name, financialSources[0].name)
  })

  it('can add again after delete', async function() {
    await addFinancialSources()
    await removeFinancialSource(financialSources[0].id)
    await request(app).post('/financial-sources').send({
      name: financialSources[0].name,
      desc: financialSources[0].desc
    }).expect(201)

    await request(app).post('/financial-sources').send({
      name: financialSources[1].name,
      desc: financialSources[1].desc
    }).expect(409)
  })

  it('can be query', async function() {
    await addFinancialSources()
    await removeFinancialSource(financialSources[0].id)
    const {body: queryResult} = await request(app).get('/financial-sources').expect(200)
    assert(queryResult.count, 1)
    assert(queryResult.rows[0].id, financialSources[1].id)
  })

  describe('tracker', async function() {
    beforeEach(async function() {
      await addFinancialSources()
      await addTrackers()
    })

    const addTrackers = async function() {
      for (let i = 0; i < financialSources.length; i++) {
        for (let j = 0; j < financialSources[i].financialSourceTrackers.length; j++) {
          const {year, month, monthlyCarryoverAmount, income, expense, balance} = financialSources[i].financialSourceTrackers[j]
          await request(app).post(`/financial-sources/${financialSources[i].id}/trackers`).send({
            year, month, monthlyCarryoverAmount, income, expense, balance
          }).expect(201)
          await request(app).post(`/financial-sources/${financialSources[i].id}/trackers`).send({
            year, month, monthlyCarryoverAmount, income, expense, balance
          }).expect(201)
          const created = await db.financialSourceTracker.findOne({
            where: {financialSourceId: financialSources[i].id, year, month},
            raw: true,
            attributes: ['id']
          })
          financialSources[i].financialSourceTrackers[j].id = created.id
        }
      }
    }
    it('can add', async function() {
      for (let i = 0; i < financialSources.length; i++) {
        assert.equal(await db.financialSourceTracker.count({
          where: {financialSourceId: financialSources[i].id}
        }), financialSources[i].financialSourceTrackers.length)
      }
    })

    it('can update', async function() {
      const financialSource = financialSources[0]
      const tracker = financialSource.financialSourceTrackers[0]
      tracker.income *= 2
      const {year, month, monthlyCarryoverAmount, income, expense, balance} = tracker
      await request(app).post(`/financial-sources/${financialSource.id}/trackers`).send({
        year, month, monthlyCarryoverAmount, income, expense, balance
      }).expect(201)
      const trackerInDb = await db.financialSourceTracker.findByPk(tracker.id)
      assert.notEqual(trackerInDb, null)
      assert.equal(trackerInDb.income, tracker.income)
    })

    it('can remove', async function() {
      const financialSource = financialSources[0]
      const tracker = financialSource.financialSourceTrackers[0]
      const {year, month} = tracker
      await request(app).delete(`/financial-sources/${financialSource.id}/trackers/${tracker.id}`).expect(204)
      const [trackerInDb, duplicatedTracker] = await Promise.all([
        db.financialSourceTracker.findByPk(tracker.id),
        db.financialSourceTracker.findOne({
          where: {year, month, financialSourceId: financialSource.id}
        })
      ])
      assert.equal(trackerInDb, null)
      assert.equal(duplicatedTracker, null)
    })

    it('can query', async function() {
      const financialSource = financialSources[0]
      const {body: {count}} = await request(app).get(`/financial-sources/${financialSource.id}/trackers`).expect(200)
      assert.equal(count, financialSource.financialSourceTrackers.length)
    })

    it('can query annual counter', async function() {
      const {body} = await request(app).get('/financial-sources/all/trackers/annual-counter?year=2020').expect(200)
      assert.equal(body.length, 2)
      assert.equal(body[0].count, 1)
      assert.equal(body[1].count, 1)
    })
  })


  const financialFlows = [{
    id: null,
    financialSourceId: null,
    abstract: '上月结余',
    humanReadableId: 'RADDNNJASAS',
    incomeAmount: 100,
    expenseAmount: 0,
    balance: 100,
    generatedAt: '2020/03/03',
    remark: 'I know'
  }, {
    id: null,
    financialSourceId: null,
    abstract: '上月结余2',
    humanReadableId: 'RADDNNJASAS',
    incomeAmount: 0,
    expenseAmount: 100,
    balance: 0,
    generatedAt: '2020/03/04'
  }]

  const addFinancialFlows = async function() {
    for (let i = 0; i < financialFlows.length; i++) {
      financialFlows[i].financialSourceId = financialSources[0].id
      const {financialSourceId, abstract, humanReadableId, incomeAmount, expenseAmount, balance, generatedAt, remark} = financialFlows[i]
      const {body} = await request(app).post(`/financial-sources/${financialSourceId}/flows`).send({
        abstract, humanReadableId, incomeAmount, expenseAmount, balance, generatedAt, remark
      }).expect(201)
      financialFlows[i].id = body.id
    }
  }

  describe('financial flow', async function() {
    beforeEach(async function() {
      await addFinancialSources()
      await addFinancialFlows()
    })

    afterEach(async function() {
      await db.financialFlow.destroy({where: {}})
    })

    it('can add', async function() {
      assert.equal(await db.financialFlow.count(), 2)
    })

    it('can updated', async function() {
      financialFlows[0].incomeAmount = 1001
      await request(app).put(`/financial-sources/${financialFlows[0].financialSourceId}/flows/${financialFlows[0].id}`).send({
        incomeAmount: financialFlows[0].incomeAmount
      }).expect(200)
      const updated = await db.financialFlow.findByPk(financialFlows[0].id)
      assert.notEqual(updated, null)
      assert.equal(updated.incomeAmount, financialFlows[0].incomeAmount)
    })

    it('can delete', async function() {
      await request(app).delete(`/financial-sources/${financialFlows[0].financialSourceId}/flows/${financialFlows[0].id}`).expect(204)
      const updated = await db.financialFlow.findByPk(financialFlows[0].id)
      assert.equal(updated, null)
    })

    it('can query', async function() {
      const {body: {count, rows}} = await request(app).get(`/financial-sources/${financialFlows[0].financialSourceId}/flows?pageSize=1`).expect(200)
      assert.equal(count, 2)
      assert.equal(rows.length, 1)
    })
  })
})

module.exports = {
  financialSources,
  addFinancialSources,
  cleanFinancialSource
}
