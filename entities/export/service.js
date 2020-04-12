const xl = require('excel4node')
const DocumentService = require('../document/service')
const ProjectService = require('../project/service')
const lodash = require('lodash')
const db = require('../../database/models')
const LiquidityParentType = require('../../enum/liquidity_parent_type')
const moment = require('moment')

const range12 = lodash.range(12)

module.exports = class {
  static async annualFinance(transaction, {year}, {wb = new xl.Workbook()} = {}) {
    const annual = await Promise.all(
        range12.map((month) => DocumentService.queryRespectiveMonthlyStatistics(transaction, year, month))
    )
    const financialSources = annual[0]
    const financeCount = financialSources.length
    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const total = {expense: [], income: [], balance: []}
    const ws = wb.addWorksheet(`${year}年度资金表`)
    ws.cell(1, 1, 1, 15, true).string(`${year}年度资金表`).style(contextStyle).style({font: {size: 24}})
    ws.cell(2, 1, 3, 3, true).style(contextStyle)
    ws.cell(2, 4, 2, 15, true).string('月份').style(contextStyle)
    range12.forEach((month) => {
      ws.cell(3, 4 + month).string(`${month + 1}月`).style(contextStyle)
    })
    ws.cell(4, 1, 4 + 3 * financeCount, 1, true).string('收入').style(contextStyle)
    ws.cell(5 + 3 * financeCount, 1, 5 + 4 * financeCount, 1, true).string('支出').style(contextStyle)
    ws.cell(6 + 4 * financeCount, 1, 6 + 5 * financeCount, 1, true).string('余额').style(contextStyle)
    financialSources.forEach((fs, index) => {
      ws.cell(4 + (index * 3), 2, 6 + index * 3, 2, true).string(fs.name).style(contextStyle)
      ws.cell(4 + (index * 3), 3).string('上月结转').style(contextStyle)
      ws.cell(5 + (index * 3), 3).string('当月收入').style(contextStyle)
      ws.cell(6 + (index * 3), 3).string('小计').style(contextStyle)

      ws.cell(5 + 3 * financeCount + index, 2, 5 + 3 * financeCount + index, 3, true).string(fs.name).style(contextStyle)

      ws.cell(6 + 4 * financeCount + index, 2, 6 + 4 * financeCount + index, 3, true).string(fs.name).style(contextStyle)

      range12.forEach((month) => {
        const {monthlyStatistics: {monthlyCarryoverAmount, expense, income, balance}} = annual[month].find((_) => _.id === fs.id)

        ws.cell(4 + (index * 3), 4 + month).number(monthlyCarryoverAmount)
        ws.cell(5 + (index * 3), 4 + month).number(income)
        ws.cell(6 + (index * 3), 4 + month).number(monthlyCarryoverAmount + income)
        total.income[month] = total.income[month] || 0
        total.income[month] += monthlyCarryoverAmount + income

        ws.cell(5 + 3 * financeCount + index, 4 + month).number(expense)
        total.expense[month] = total.expense[month] || 0
        total.expense[month] += expense

        ws.cell(6 + 4 * financeCount + index, 4 + month).number(balance)
        total.balance[month] = total.balance[month] || 0
        total.balance[month] += balance
      })
    })
    ws.cell(4 + 3 * financeCount, 2, 4 + 3 * financeCount, 3, true).string('合计').style(contextStyle)
    ws.cell(5 + 4 * financeCount, 2, 5 + 4 * financeCount, 3, true).string('合计').style(contextStyle)
    ws.cell(6 + 5 * financeCount, 2, 6 + 5 * financeCount, 3, true).string('合计').style(contextStyle)

    range12.forEach((month) => {
      ws.cell(4 + 3 * financeCount, 4 + month).number(total.income[month])
      ws.cell(5 + 4 * financeCount, 4 + month).number(total.expense[month])
      ws.cell(6 + 5 * financeCount, 4 + month).number(total.balance[month])
    })

    ws.cell(2, 1, 6 + 5 * financeCount, 15).style({
      border: {
        left: {style: 'thin', color: 'black'},
        right: {style: 'thin', color: 'black'},
        top: {style: 'thin', color: 'black'},
        bottom: {style: 'thin', color: 'black'},
        diagonal: {style: 'thin', color: 'black'}
      }
    })

    return wb
  }

  static async annualProject(transaction, {year}, {wb = new xl.Workbook()} = {}) {
    const annual = await Promise.all(
        range12.map((month) => DocumentService.queryRespectiveMonthlyStatistics(transaction, year, month))
    )
    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const total = {expense: 0, income: 0}
    const ws = wb.addWorksheet(`${year}年度项目收支表`)
    ws.cell(1, 1, 1, 4, true).string(`${year}年度项目收支表`).style(contextStyle).style({font: {size: 24}})
    ws.cell(2, 1).string('月份').style(contextStyle)
    ws.cell(2, 2).string('收入合计').style(contextStyle)
    ws.cell(2, 3).string('支出合计').style(contextStyle)
    ws.cell(2, 4).string('收支结余').style(contextStyle)
    range12.forEach((month) => {
      ws.cell(3 + month, 1).string(`${month + 1}月`).style(contextStyle)
      const incomeSum = lodash.sumBy(annual[month], 'monthlyStatistics.income')
      const expenseSum = lodash.sumBy(annual[month], 'monthlyStatistics.expense')

      total.income += incomeSum
      total.expense += expenseSum

      ws.cell(3 + month, 2).number(incomeSum)
      ws.cell(3 + month, 3).number(expenseSum)
      ws.cell(3 + month, 4).number(incomeSum - expenseSum)
    })

    ws.cell(15, 1).string('本年合计').style(contextStyle)
    ws.cell(15, 2).number(total.income)
    ws.cell(15, 3).number(total.expense)
    ws.cell(15, 4).number(total.income - total.expense)

    ws.cell(16, 1).string('上年结转').style(contextStyle)
    ws.cell(16, 2, 16, 4, true).number(lodash.sumBy(annual[0], 'monthlyStatistics.monthlyCarryoverAmount'))

    ws.cell(17, 1).string('当前结余').style(contextStyle)
    ws.cell(17, 2, 17, 4, true).number(lodash.sumBy(annual[0], 'monthlyStatistics.balance'))

    ws.cell(2, 1, 17, 4).style({
      border: {
        left: {style: 'thin', color: 'black'},
        right: {style: 'thin', color: 'black'},
        top: {style: 'thin', color: 'black'},
        bottom: {style: 'thin', color: 'black'},
        diagonal: {style: 'thin', color: 'black'}
      }
    })

    return wb
  }

  static async annualSpecifiedProject(transaction, {year, projectId}, {wb = new xl.Workbook()} = {}) {
    const [[result], project] = await Promise.all([
      db.sequelize.query(`
    SELECT
      lt.parentType,
      MONTH ( d.generatedAt ) - 1 AS \`month\`,
      SUM( amount ) AS total
    FROM
      documents d
      INNER JOIN liquidityTypes lt ON lt.id = d.liquidityTypeId 
    WHERE
      d.projectId = :projectId
      AND d.generatedAt BETWEEN ':year/01/01' 
      AND ':year/12/31' 
    GROUP BY
      MONTH ( d.generatedAt ),
      lt.parentType
    `, {
        transaction,
        replacements: {
          projectId, year
        }
      }),
      db.project.findByPk(projectId, {
        transaction,
        raw: true,
        attributes: ['name']
      })
    ])
    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const total = {expense: 0, income: 0}
    const ws = wb.addWorksheet(`${year}年"${project.name}"项目收支表`)
    ws.cell(1, 1, 1, 4, true).string(`${year}年"${project.name}"项目收支表`).style(contextStyle).style({font: {size: 24}})
    ws.cell(2, 1).string('月份').style(contextStyle)
    ws.cell(2, 2).string('收入').style(contextStyle)
    ws.cell(2, 3).string('支出').style(contextStyle)
    ws.cell(2, 4).string('收支结余').style(contextStyle)
    range12.forEach((month) => {
      ws.cell(3 + month, 1).string(`${month + 1}月`).style(contextStyle)
      const incomeObj = result.find((_) => _.month == month && _.parentType == LiquidityParentType.INCOME) || {}
      const expenseObj = result.find((_) => _.month == month && _.parentType == LiquidityParentType.EXPENSE) || {}
      const incomeSum = Number(incomeObj.total || 0)
      const expenseSum = Number(expenseObj.total || 0)

      total.income += incomeSum
      total.expense += expenseSum

      ws.cell(3 + month, 2).number(incomeSum)
      ws.cell(3 + month, 3).number(expenseSum)
      ws.cell(3 + month, 4).number(incomeSum - expenseSum)
    })

    ws.cell(15, 1).string('合计').style(contextStyle)
    ws.cell(15, 2).number(total.income)
    ws.cell(15, 3).number(total.expense)
    ws.cell(15, 4).number(total.income - total.expense)

    ws.cell(2, 1, 15, 4).style({
      border: {
        left: {style: 'thin', color: 'black'},
        right: {style: 'thin', color: 'black'},
        top: {style: 'thin', color: 'black'},
        bottom: {style: 'thin', color: 'black'},
        diagonal: {style: 'thin', color: 'black'}
      }
    })

    return wb
  }

  static async annualSpecifiedProjectDetail(transaction, {year, projectId}, {wb = new xl.Workbook()} = {}) {
    const [[result], {rows: [project]}] = await Promise.all([
      db.sequelize.query(`
    SELECT
      lt.parentType,
      MONTH ( d.generatedAt ) - 1 AS \`month\`,
      SUM( amount ) AS total,
      lt.type 
    FROM
      documents d
      INNER JOIN liquidityTypes lt ON lt.id = d.liquidityTypeId 
    WHERE
      d.projectId = :projectId
      AND d.generatedAt BETWEEN ':year/01/01' 
      AND ':year/12/31' 
    GROUP BY
      MONTH ( d.generatedAt ),
      lt.parentType,
      lt.type
    `, {
        transaction,
        replacements: {
          projectId, year
        }
      }),
      ProjectService.query(transaction, {id: projectId}, {pageSize: 1})
    ])
    const incomeLiquidityTypes = project.liquidityTypes.filter((_) => _.parentType === LiquidityParentType.INCOME)
    const expenseLiquidityTypes = project.liquidityTypes.filter((_) => _.parentType === LiquidityParentType.EXPENSE)
    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const ws = wb.addWorksheet(`${year}年度"${project.name}"项目收支统计表`)
    ws.cell(1, 1, 1, project.liquidityTypes.length + 4, true).string(`${year}年度"${project.name}"项目收支统计表`).style(contextStyle).style({font: {size: 24}})
    ws.cell(2, 1, 3, 1, true).string('月份').style(contextStyle)
    ws.cell(2, 2, 2, 2 + incomeLiquidityTypes.length, true).string('收入').style(contextStyle)
    ws.cell(3, incomeLiquidityTypes.length + 2).string('合计').style(contextStyle)
    ws.cell(2, incomeLiquidityTypes.length + 3, 2, incomeLiquidityTypes.length + expenseLiquidityTypes.length + 3, true).string('支出').style(contextStyle)
    ws.cell(3, incomeLiquidityTypes.length + expenseLiquidityTypes.length + 3).string('合计').style(contextStyle)
    ws.cell(2, incomeLiquidityTypes.length + expenseLiquidityTypes.length + 4, 3, incomeLiquidityTypes.length + expenseLiquidityTypes.length + 4, true).string('结余').style(contextStyle)

    const monthlyTotal = {
      income: [],
      expense: []
    }

    incomeLiquidityTypes.forEach(({parentType, type}, index) => {
      ws.cell(3, 2 + index).string(type).style(contextStyle)
      let total = 0
      range12.forEach((month) => {
        if (index === 0) {
          ws.cell(month + 4, 1).string(`${month + 1}月`).style(contextStyle)
        }
        monthlyTotal.income[month] = monthlyTotal.income[month] || 0
        const statistic = result.find((_) => _.parentType == parentType && _.type == type && _.month == month) || {}
        total += Number(statistic.total || 0)
        monthlyTotal.income[month] += Number(statistic.total || 0)

        ws.cell(month + 4, 2 + index).number(Number(statistic.total || 0))

        if (index === incomeLiquidityTypes.length - 1) {
          ws.cell(month + 4, 2 + incomeLiquidityTypes.length).number(monthlyTotal.income[month])
        }
      })
      ws.cell(16, 2 + index).number(total)

      if (index === incomeLiquidityTypes.length - 1) {
        ws.cell(16, 2 + incomeLiquidityTypes.length).number(lodash.sum(monthlyTotal.income))
      }
    })

    expenseLiquidityTypes.forEach(({parentType, type}, index) => {
      ws.cell(3, 3 + incomeLiquidityTypes.length + index).string(type).style(contextStyle)
      let total = 0
      range12.forEach((month) => {
        monthlyTotal.expense[month] = monthlyTotal.expense[month] || 0
        const statistic = result.find((_) => _.parentType == parentType && _.type == type && _.month == month) || {}
        total += Number(statistic.total || 0)
        monthlyTotal.expense[month] += Number(statistic.total || 0)

        ws.cell(month + 4, 3 + incomeLiquidityTypes.length + index).number(Number(statistic.total || 0))

        if (index === expenseLiquidityTypes.length - 1) {
          ws.cell(month + 4, 3 + incomeLiquidityTypes.length + expenseLiquidityTypes.length).number(monthlyTotal.expense[month])
          ws.cell(month + 4, 4 + incomeLiquidityTypes.length + expenseLiquidityTypes.length).number(monthlyTotal.income[month] - monthlyTotal.expense[month])
        }
      })
      ws.cell(16, 3 + incomeLiquidityTypes.length + index).number(total)

      if (index === expenseLiquidityTypes.length - 1) {
        ws.cell(16, 3 + incomeLiquidityTypes.length + expenseLiquidityTypes.length).number(lodash.sum(monthlyTotal.expense))
        ws.cell(16, 4 + incomeLiquidityTypes.length + expenseLiquidityTypes.length).number(lodash.sum(monthlyTotal.income) - lodash.sum(monthlyTotal.expense))
      }
    })

    ws.cell(16, 1).string('合计').style(contextStyle)

    ws.cell(2, 1, 16, project.liquidityTypes.length + 4).style({
      border: {
        left: {style: 'thin', color: 'black'},
        right: {style: 'thin', color: 'black'},
        top: {style: 'thin', color: 'black'},
        bottom: {style: 'thin', color: 'black'},
        diagonal: {style: 'thin', color: 'black'}
      }
    })

    return wb
  }

  static async monthlyDocument(transaction, {year, month}, {wb = new xl.Workbook()} = {}) {
    const {rows} = await DocumentService.query(transaction, {
      generatedAtFrom: `${year}/${month}/1`,
      generatedAtTo: `${year}/${month + 1}/1`
    }, {pageSize: Number.MAX_SAFE_INTEGER})

    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const ws = wb.addWorksheet(`${year}年${month}月凭证列表`)
    ws.cell(1, 1, 1, 11, true).string(`${year}年${month}月凭证列表`).style(contextStyle).style({font: {size: 24}});
    ['序号', '项目', '资金渠道', '凭证号', '摘要', '收支', '收支类型', '金额', '发生时间', '经办人', '备注'].forEach((item, index) => {
      ws.cell(2, index + 1).string(item).style(contextStyle)
    })

    ws.column(2).setWidth(25)
    ws.column(4).setWidth(25)
    ws.column(5).setWidth(40)
    ws.column(11).setWidth(40)

    rows.forEach((document, index) => {
      ws.cell(3 + index, 1).number(index + 1)
      ws.cell(3 + index, 2).string(document.project.name).style(contextStyle)
      ws.cell(3 + index, 3).string(document.financialSource.name).style(contextStyle)
      ws.cell(3 + index, 4).string(document.humanReadableId).style(contextStyle)
      ws.cell(3 + index, 5).string(document.abstract).style(contextStyle)
      ws.cell(3 + index, 6).string(document.liquidityType.parentType === LiquidityParentType.INCOME && '收入' || '支出').style(contextStyle)
      ws.cell(3 + index, 7).string(document.liquidityType.type).style(contextStyle)
      ws.cell(3 + index, 8).number(document.amount)
      ws.cell(3 + index, 9).string(moment(document.generatedAt).format('YYYY/MM/DD')).style(contextStyle)
      ws.cell(3 + index, 10).string(document.handler).style(contextStyle)
      ws.cell(3 + index, 11).string(document.remark).style(contextStyle)
    })

    // ws.cell(16, 1).string('合计').style(contextStyle)

    ws.cell(2, 1, rows.length + 2, 11).style({
      border: {
        left: {style: 'thin', color: 'black'},
        right: {style: 'thin', color: 'black'},
        top: {style: 'thin', color: 'black'},
        bottom: {style: 'thin', color: 'black'},
        diagonal: {style: 'thin', color: 'black'}
      }
    })

    return wb
  }


  static async monthlyProject(transaction, {year, month, projectId}, {wb = new xl.Workbook()} = {}) {
    const [{rows}, project] = await Promise.all([
      DocumentService.query(transaction, {
        generatedAtFrom: `${year}/${month}/1`,
        generatedAtTo: `${year}/${month + 1}/1`,
        projectId
      }, {pageSize: Number.MAX_SAFE_INTEGER}),
      db.project.findByPk(projectId, {
        transaction,
        raw: true,
        attributes: ['name']
      })
    ])

    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const ws = wb.addWorksheet(`${year}年${month}月“${project.name}”项目凭证详情`)
    ws.cell(1, 1, 1, 11, true).string(`${year}年${month}月“${project.name}”项目凭证详情`).style(contextStyle).style({font: {size: 24}});
    ['摘要', '类型', '金额', '凭证号', '小计', '合计'].forEach((item, index) => {
      ws.cell(2, index + 2).string(item).style(contextStyle)
    })

    ws.column(2).setWidth(25)
    ws.column(5).setWidth(40)

    const parentTypeGroup = lodash.groupBy(rows, 'liquidityType.parentType')
    console.log([3, 1, 3 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length, 1, true])
    ws.cell(3, 1, 3 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length, 1, true).string('收入').style(contextStyle)
    console.log([3 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length, 1,
      2 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length + (parentTypeGroup[LiquidityParentType.EXPENSE] || {length: 0}).length, 1,
      true])
    ws.cell(
        3 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length, 1,
        2 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length + (parentTypeGroup[LiquidityParentType.EXPENSE] || {length: 0}).length, 1,
        true
    ).string('支出').style(contextStyle)
    let counter = 3;
    [LiquidityParentType.INCOME, LiquidityParentType.EXPENSE].forEach((parentType, index) => {
      const typeGroup = lodash.groupBy(parentTypeGroup[parentType], 'liquidityType.type')
      const parentTypeCounter = counter
      let parentTypeTotal = 0
      Object.values(typeGroup).forEach((documents) => {
        let typeTotal = 0
        const typeCounter = counter
        documents.forEach((document) => {
          ws.cell(counter, 2).string(document.abstract).style(contextStyle)
          ws.cell(counter, 3).string(document.liquidityType.type).style(contextStyle)
          ws.cell(counter, 4).number(document.amount / 2)
          ws.cell(counter, 5).string(document.humanReadableId).style(contextStyle)
          typeTotal += document.amount
          counter++
        })
        ws.cell(typeCounter, 6).number(typeTotal / 2)
        parentTypeTotal += typeTotal
      })
      ws.cell(parentTypeCounter, 7).number(parentTypeTotal / 2)
    })

    ws.cell(2, 1, counter - 1, 7).style({
      border: {
        left: {style: 'thin', color: 'black'},
        right: {style: 'thin', color: 'black'},
        top: {style: 'thin', color: 'black'},
        bottom: {style: 'thin', color: 'black'},
        diagonal: {style: 'thin', color: 'black'}
      }
    })

    return wb
  }
}
