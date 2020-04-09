const db = require('../../database/models')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  static async add(transaction, document) {
    const {generatedAt, financialSourceId, amount, liquidityTypeId} = document
    const liquidityType = await db.liquidityType.findByPk(liquidityTypeId, {
      transaction,
      raw: true,
      attributes: ['parentType']
    })
    const [created] = await Promise.all([
      db.document.create(document, {
        transaction,
        raw: true
      }),
      this.saveOrUpdateDocumentSummary(
          transaction,
          financialSourceId,
          generatedAt.getFullYear(),
          generatedAt.getMonth(),
          liquidityType.parentType,
          amount
      )
    ])
    return created
  }

  static async update(transaction, documentId, document) {
    let {amount, financialSourceId, liquidityTypeId, generatedAt} = document
    let [existed, liquidityType] = await Promise.all([
      db.document.findByPk(documentId, {
        attributes: ['id', 'amount', 'generatedAt', 'financialSourceId'],
        include: [{
          model: db.liquidityType,
          attributes: ['parentType']
        }],
        transaction
      }),
      liquidityTypeId? db.liquidityType.findByPk(liquidityTypeId, {
        transaction,
        raw: true,
        attributes: ['parentType']
      }): undefined
    ])
    if (!existed) return
    existed = existed.toJSON()
    existed.generatedAt = new Date(existed.generatedAt)

    generatedAt = generatedAt || existed.generatedAt
    liquidityType = liquidityType === undefined? existed.liquidityType: liquidityType
    financialSourceId = financialSourceId || existed.financialSourceId

    const [updated] = await Promise.all([
      db.document.update(document, {
        where: {id: documentId},
        transaction
      }),
      this.saveOrUpdateDocumentSummary(
          transaction,
          existed.financialSourceId,
          existed.generatedAt.getFullYear(),
          existed.generatedAt.getMonth(),
          existed.liquidityType.parentType,
          -existed.amount
      ),
      this.saveOrUpdateDocumentSummary(
          transaction,
          financialSourceId,
          generatedAt.getFullYear(),
          generatedAt.getMonth(),
          liquidityType.parentType,
          amount
      )
    ])
    return updated
  }

  static async remove(transaction, documentId) {
    const existed = await db.document.findByPk(documentId, {
      attributes: ['id', 'financialSourceId', 'generatedAt', 'amount'],
      include: [{
        model: db.liquidityType,
        attributes: ['parentType']
      }],
      transaction
    })
    if (!existed) return
    let {amount, financialSourceId, generatedAt, liquidityType} = existed
    generatedAt = new Date(generatedAt)
    const [deleteResult] = await Promise.all([
      db.document.destroy({
        where: {id: documentId},
        transaction
      }),
      this.saveOrUpdateDocumentSummary(transaction, financialSourceId, generatedAt.getFullYear(), generatedAt.getMonth(), liquidityType.parentType, -amount)
    ])
    return deleteResult
  }

  static async query(transaction, queryCondition, pageAndOrder) {
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
          model: db.project,
          paranoid: false
        }, {
          model: db.liquidityType,
          paranoid: false
        }, {
          model: db.financialSource,
          paranoid: false
        }],
        transaction
      })
    ])
    return {count, rows: rows.map((_) => _.toJSON())}
  }

  static async saveOrUpdateDocumentSummary(transaction, financialSourceId, year, month, liquidityParentType, amount) {
    const existedSummary = await db.documentSummary.findOne({
      where: {financialSourceId, year, month},
      attributes: ['id', liquidityParentType],
      transaction
    })
    if (!existedSummary) {
      return db.documentSummary.create(
          {financialSourceId, year, month, [liquidityParentType]: amount},
          {transaction}
      )
    }
    existedSummary[liquidityParentType] += amount
    return existedSummary.save({transaction})
  }

  /**
   *
   * @param {*} transaction
   * @param {*} sqlWhere
   * @return {{financialSourceId: number, totalIncome: number, totalExpense: number}[]}
   */
  static async getGrossProfit(transaction, sqlWhere) {
    const [result] = await db.sequelize.query(`
      SELECT 
        financialSourceId,
        SUM(income) AS totalIncome,
        SUM(expense) AS totalExpense
      FROM documentSummaries
      WHERE ${sqlWhere}
      GROUP BY financialSourceId
    `, {
      transaction
    })
    result.forEach((_) => {
      _.totalIncome = Number(_.totalIncome)
      _.totalExpense = Number(_.totalExpense)
    })
    return result
  }

  static async queryRespectiveMonthlyStatistics(transaction, year, month) {
    const before = await this.getGrossProfit(transaction, `year < ${year} OR (year = ${year} AND month < ${month})`)
    const thisMonth = await this.getGrossProfit(transaction, `year = ${year} AND month = ${month}`)
    const financialSources = await db.financialSource.findAll({
      transaction, raw: true
    })
    return financialSources.map((fs) => {
      const {totalExpense = 0, totalIncome = 0} = before.find((_) => _.financialSourceId === fs.id) || {}
      const {totalExpense: expense = 0, totalIncome: income = 0} = thisMonth.find((_) => _.financialSourceId === fs.id) || {}
      fs.monthlyStatistics = {
        monthlyCarryoverAmount: fs.initialStock - totalExpense + totalIncome,
        expense,
        income,
        balance: fs.initialStock - totalExpense - expense + totalIncome + income
      }
      return fs
    })
  }
}
