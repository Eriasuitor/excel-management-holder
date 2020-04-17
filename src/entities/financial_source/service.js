const {superError} = require('../../utils/error')
const db = require('../../database/models')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  static async add(transaction, financialSource) {
    const existedSource = await db.financialSource.findOne({
      where: {name: financialSource.name},
      paranoid: false,
      transaction
    })
    if (existedSource) {
      if (existedSource.deletedAt !== null) {
        existedSource.desc = financialSource.desc
        return existedSource.restore({transaction})
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
      const existedSource = await db.financialSource.findOne({
        where: {name: financialSource.name},
        raw: true,
        attributes: ['id'],
        transaction
      })
      if (existedSource) {
        if (existedSource.id != financialSourceId) {
          superError(409, `资金渠道“${financialSource.name}”已经或曾经存在。`).throw()
        }
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
    let {count, rows} = await db.financialSource.findAndCountAll({
      ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
      ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
      transaction
    })
    rows = rows.map((_) => _.toJSON())
    return {count, rows}
  }
}
