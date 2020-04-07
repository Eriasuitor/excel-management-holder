const {superError} = require('../../utils/error')
const db = require('../../database/models')
const sqlTool = require('../../utils/sqlTool')
const DocumentService = require('../document/service')

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

  static async queryRespectiveMonthlyStatistics(transaction, year, month) {
    const before = DocumentService.getGrossProfit(transaction, `year < ${year} OR (year = ${year} AND month < ${month})`)
    const thisMonth = DocumentService.getGrossProfit(transaction, `year = ${year} AND month = ${month}`)
    const financialSources = await db.financialSource.findAll({
      transaction, raw: true, attributes: ['id', 'initialStock']
    })
    return financialSources.map((fs) => {
      const {totalExpense = 0, totalIncome = 0} = before.find((_) => _.financialSourceId === fs.id) || {}
      const {totalExpense: expense = 0, totalIncome: income = 0} = thisMonth.find((_) => _.financialSourceId === fs.id) || {}
      return {
        monthlyCarryoverAmount: fs.initialStock - totalExpense + totalIncome,
        expense,
        income,
        balance: fs.initialStock - totalExpense - expense + totalIncome + income
      }
    })
  }
}
