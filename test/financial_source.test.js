const app = require('../app')
const request = require('supertest')
const assert = require('power-assert')
const db = require('../database/models')

const financialSources = [{
  name: '711',
  desc: '建行',
  initialStock: 10000
}, {
  name: '999',
  desc: '工行',
  initialStock: 1000
}]

const addFinancialSources = async function() {
  for (let i = 0; i < financialSources.length; i++) {
    const financialSource = financialSources[i]
    await request(app).post('/financial-sources').send({
      name: financialSource.name,
      desc: financialSource.desc,
      initialStock: financialSource.initialStock
    }).expect(201)
  }
  for (let i = 0; i < financialSources.length; i++) {
    const financialSource = financialSources[i]
    await request(app).post('/financial-sources').send({
      name: financialSource.name,
      desc: financialSource.desc,
      initialStock: financialSource.initialStock
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
    await db.sequelize.query(`
     DELETE FROM financialSources;
    `)
  })

  it('can add financialSource', async function() {
    await addFinancialSources()
  })

  it('can not update initial stock after created', async function() {
    await addFinancialSources()
    const financialSource = financialSources[0]
    await request(app).put(`/financial-sources/${financialSource.id}`).send({
      initialStock: 1
    }).expect(400)
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
    assert(queryResult.rows[0].initialStock, financialSources[1].initialStock)
  })
})

module.exports = {
  financialSources,
  addFinancialSources,
  cleanFinancialSource
}
