const db = require('../../database/models')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  static async add(transaction, document) {
    return db.document.create(document, {
      transaction,
      raw: true
    })
  }

  static async update(transaction, documentId, document) {
    return db.document.update(document, {
      where: {id: documentId},
      transaction
    })
  }

  static async remove(transaction, documentId) {
    return db.document.destroy({
      where: {id: documentId},
      transaction
    })
  }

  static async query(transaction, queryCondition, pageAndOrder) {
    console.log(queryCondition)
    const [count, rows] = await Promise.all([
      db.document.count({
        ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
        ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
        transaction
      }),
      db.document.findAll({
        ...sqlTool.resolveSequelizeSelectCondition(queryCondition),
        ...sqlTool.resolveSequelizePageAndOrder(pageAndOrder),
        include: [{
          model: db.project
        }, {
          model: db.liquidityType
        }, {
          model: db.financialSource
        }],
        transaction
      })
    ])
    return {count, rows: rows.map((_) => _.toJSON())}
  }
}
