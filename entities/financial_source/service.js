const {superError} = require('../../utils/error')
const db = require('../../database/models')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  static async add(transaction, financialSource) {
    const existedProject = await db.financialSource.findOne({
      where: {name: financialSource.name},
      paranoid: false,
      transaction
    })
    if (existedProject) {
      if (existedProject.deletedAt !== null) {
        existedProject.desc = financialSource.desc
        return existedProject.restore({transaction})
      }
      superError(409, `资金渠道“${financialSource.name}”已经存在。`).throw()
    }
    return db.financialSource.create(financialSource, {
      transaction,
      raw: true
    })
  }

  static async update(transaction, financialSourceId, financialSource) {
    if (financialSource.name) {
      const existedProject = await db.financialSource.findOne({
        where: {name: financialSource.name},
        raw: true,
        attributes: ['id'],
        transaction
      })
      if (existedProject) {
        if (existedProject.id == financialSourceId) {
          return existedProject
        }
        superError(409, `资金渠道“${financialSource.name}”已经或曾经存在。`).throw()
      }
    }
    return db.financialSource.update(financialSource, {
      where: {id: financialSourceId},
      transaction
    })
  }

  static async remove(transaction, financialSourceId) {
    return db.financialSource.destroy({
      where: {id: financialSourceId},
      transaction
    })
  }

  static async query(transaction, queryCondition, pageAndOrder) {
    const {count, rows} = await db.financialSource.findAndCountAll({
      ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
      ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
      transaction
    })
    return {count, rows: rows.map((_) => _.toJSON())}
  }

  static async addOrUpdateTracker(transaction, tracker) {
    return db.financialSourceTracker.bulkCreate([tracker], {
      updateOnDuplicate: ['financialSourceId', 'year', 'month', 'monthlyCarryoverAmount', 'income', 'expense', 'balance', 'updatedAt'],
      transaction
    })
  }

  static async removeTracker(transaction, trackerId) {
    return db.financialSourceTracker.destroy({
      where: {id: trackerId},
      transaction
    })
  }

  static async queryTracker(transaction, queryCondition, pageAndOrder) {
    return db.financialSourceTracker.findAndCountAll({
      ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
      ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
      raw: true,
      transaction
    })
  }

  static async queryTrackerAnnualCounter(transaction, year) {
    const [rows] = await db.sequelize.query(`
    SELECT
      month,
      COUNT( * ) AS count 
    FROM
      financialSourceTrackers 
    INNER JOIN financialSources ON financialSources.id = financialSourceTrackers.financialSourceId
    WHERE
      year = :year AND financialSources.deletedAt IS NULL
    GROUP BY
      month
    `, {
      transaction,
      replacements: {year}
    })
    return rows
  }

  static async addFinancialFlow(transaction, financialFlow) {
    return db.financialFlow.create(financialFlow, {
      transaction
    })
  }

  static async updateFinancialFlow(transaction, financialFlowId, financialFlow) {
    return db.financialFlow.update(financialFlow, {
      where: {id: financialFlowId},
      transaction
    })
  }

  static async removeFinancialFlow(transaction, financialFlowId) {
    return db.financialFlow.destroy({
      where: {id: financialFlowId},
      transaction
    })
  }

  static async queryFinancialFlow(transaction, queryCondition, pageAndOrder) {
    const [count, rows] = await Promise.all([
      db.financialFlow.count({
        ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
        transaction
      }),
      db.financialFlow.findAll({
        ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
        ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
        include: [{
          model: db.financialSource
        }],
        transaction
      })
    ])
    return {count, rows: rows.map((_) => _.toJSON())}
  }
}
