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
    const total = {
      expense: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      income: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      balance: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
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
    let curMonth = moment().get('month')
    const curYear = moment().get('year')
    if (curYear > year) {
      curMonth = 12
    } else if (curYear < year) {
      curMonth = -1
    }

    financialSources.forEach((fs, index) => {
      ws.cell(4 + (index * 3), 2, 6 + index * 3, 2, true).string(fs.name).style(contextStyle)
      ws.cell(4 + (index * 3), 3).string('上月结转').style(contextStyle)
      ws.cell(5 + (index * 3), 3).string('当月收入').style(contextStyle)
      ws.cell(6 + (index * 3), 3).string('小计').style(contextStyle)

      ws.cell(5 + 3 * financeCount + index, 2, 5 + 3 * financeCount + index, 3, true).string(fs.name).style(contextStyle)

      ws.cell(6 + 4 * financeCount + index, 2, 6 + 4 * financeCount + index, 3, true).string(fs.name).style(contextStyle)

      range12.forEach((month) => {
        if (month > curMonth) {
          return
        }
        const {monthlyStatistics: {monthlyCarryoverAmount, expense, income, balance}} = annual[month].find((_) => _.id === fs.id)
        ws.cell(4 + (index * 3), 4 + month).number(monthlyCarryoverAmount / 100)
        ws.cell(5 + (index * 3), 4 + month).number(income / 100)
        ws.cell(6 + (index * 3), 4 + month).number((monthlyCarryoverAmount + income) / 100)
        total.income[month] = total.income[month] || 0
        total.income[month] += monthlyCarryoverAmount + income

        ws.cell(5 + 3 * financeCount + index, 4 + month).number(expense / 100)
        total.expense[month] = total.expense[month] || 0
        total.expense[month] += expense

        ws.cell(6 + 4 * financeCount + index, 4 + month).number(balance / 100)
        total.balance[month] = total.balance[month] || 0
        total.balance[month] += balance
      })
    })
    ws.cell(4 + 3 * financeCount, 2, 4 + 3 * financeCount, 3, true).string('合计').style(contextStyle)
    ws.cell(5 + 4 * financeCount, 2, 5 + 4 * financeCount, 3, true).string('合计').style(contextStyle)
    ws.cell(6 + 5 * financeCount, 2, 6 + 5 * financeCount, 3, true).string('合计').style(contextStyle)

    range12.forEach((month) => {
      if (month > curMonth) {
        return
      }
      ws.cell(4 + 3 * financeCount, 4 + month).number(total.income[month] / 100)
      ws.cell(5 + 4 * financeCount, 4 + month).number(total.expense[month] / 100)
      ws.cell(6 + 5 * financeCount, 4 + month).number(total.balance[month] / 100)
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

      ws.cell(3 + month, 2).number(incomeSum / 100)
      ws.cell(3 + month, 3).number(expenseSum / 100)
      ws.cell(3 + month, 4).number((incomeSum - expenseSum) / 100)
    })

    ws.cell(15, 1).string('本年合计').style(contextStyle)
    ws.cell(15, 2).number(total.income / 100)
    ws.cell(15, 3).number(total.expense / 100)
    ws.cell(15, 4).number((total.income - total.expense) / 100)

    ws.cell(16, 1).string('上年结转').style(contextStyle)
    ws.cell(16, 2, 16, 4, true).number(lodash.sumBy(annual[0], 'monthlyStatistics.monthlyCarryoverAmount') / 100)

    ws.cell(17, 1).string('当前结余').style(contextStyle)
    ws.cell(17, 2, 17, 4, true).number(lodash.sumBy(annual[11], 'monthlyStatistics.balance') / 100)

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

      ws.cell(3 + month, 2).number(incomeSum / 100)
      ws.cell(3 + month, 3).number(expenseSum / 100)
      ws.cell(3 + month, 4).number((incomeSum - expenseSum) / 100)
    })

    ws.cell(15, 1).string('合计').style(contextStyle)
    ws.cell(15, 2).number(total.income / 100)
    ws.cell(15, 3).number(total.expense / 100)
    ws.cell(15, 4).number((total.income - total.expense) / 100)

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
    project.liquidityTypes = lodash.sortBy(project.liquidityTypes, 'id')
    const incomeLiquidityTypes = project.liquidityTypes.filter((_) => _.parentType === LiquidityParentType.INCOME)
    const expenseLiquidityTypes = project.liquidityTypes.filter((_) => _.parentType === LiquidityParentType.EXPENSE)
    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const ws = wb.addWorksheet(`${year}年度"${project.name}"项目收支统计表`)
    ws.cell(1, 1, 1, (incomeLiquidityTypes.length || -1) + (expenseLiquidityTypes.length || -1) + 4, true).string(`${year}年度"${project.name}"项目收支统计表`).style(contextStyle).style({font: {size: 24}})
    ws.cell(2, 1, 3, 1, true).string('月份').style(contextStyle)
    if (incomeLiquidityTypes.length !== 0) {
      ws.cell(2, 2, 2, 2 + incomeLiquidityTypes.length, true).string('收入').style(contextStyle)
      ws.cell(3, incomeLiquidityTypes.length + 2).string('合计').style(contextStyle)
    }

    if (expenseLiquidityTypes.length !== 0) {
      ws.cell(2, (incomeLiquidityTypes.length || -1) + 3, 2, (incomeLiquidityTypes.length || -1) + (expenseLiquidityTypes.length || -1) + 3, true).string('支出').style(contextStyle)
      ws.cell(3, (incomeLiquidityTypes.length || -1) + expenseLiquidityTypes.length + 3).string('合计').style(contextStyle)
    }

    ws.cell(2, (incomeLiquidityTypes.length || -1) + (expenseLiquidityTypes.length || -1) + 4, 3, (incomeLiquidityTypes.length || -1) + (expenseLiquidityTypes.length || -1) + 4, true).string('结余').style(contextStyle)

    const monthlyTotal = {
      income: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      expense: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }

    range12.forEach((month) => {
      ws.cell(month + 4, 1).string(`${month + 1}月`).style(contextStyle)
    })
    incomeLiquidityTypes.forEach(({parentType, type}, index) => {
      ws.cell(3, 2 + index).string(type).style(contextStyle)
      let total = 0
      range12.forEach((month) => {
        const statistic = result.find((_) => _.parentType == parentType && _.type == type && _.month == month) || {}
        total += Number(statistic.total || 0)
        monthlyTotal.income[month] += Number(statistic.total || 0)

        ws.cell(month + 4, 2 + index).number(Number(statistic.total || 0) / 100)

        if (index === incomeLiquidityTypes.length - 1) {
          ws.cell(month + 4, 2 + incomeLiquidityTypes.length).number(monthlyTotal.income[month] / 100)
        }
      })
      ws.cell(16, 2 + index).number(total / 100)

      if (index === incomeLiquidityTypes.length - 1) {
        ws.cell(16, 2 + incomeLiquidityTypes.length).number(lodash.sum(monthlyTotal.income) / 100)
      }
    })

    expenseLiquidityTypes.forEach(({parentType, type}, index) => {
      ws.cell(3, 3 + (incomeLiquidityTypes.length || -1) + index).string(type).style(contextStyle)
      let total = 0
      range12.forEach((month) => {
        monthlyTotal.expense[month] = monthlyTotal.expense[month] || 0
        const statistic = result.find((_) => _.parentType == parentType && _.type == type && _.month == month) || {}
        total += Number(statistic.total || 0)
        monthlyTotal.expense[month] += Number(statistic.total || 0)

        ws.cell(month + 4, 3 + (incomeLiquidityTypes.length || -1) + index).number(Number(statistic.total || 0) / 100)

        if (index === expenseLiquidityTypes.length - 1) {
          ws.cell(month + 4, 3 + (incomeLiquidityTypes.length || -1) + expenseLiquidityTypes.length).number(monthlyTotal.expense[month] / 100)
        }
      })
      ws.cell(16, 3 + (incomeLiquidityTypes.length || -1) + index).number(total / 100)

      if (index === expenseLiquidityTypes.length - 1) {
        ws.cell(16, 3 + (incomeLiquidityTypes.length || -1) + expenseLiquidityTypes.length).number(lodash.sum(monthlyTotal.expense) / 100)
      }
    })

    range12.forEach((month) => {
      ws.cell(month + 4, 4 + (incomeLiquidityTypes.length || -1) + (expenseLiquidityTypes.length || -1)).number((monthlyTotal.income[month] - monthlyTotal.expense[month]) / 100)
    })
    ws.cell(16, 4 + (incomeLiquidityTypes.length || -1)+ (expenseLiquidityTypes.length || -1)).number((lodash.sum(monthlyTotal.income) - lodash.sum(monthlyTotal.expense)) / 100)

    ws.cell(16, 1).string('合计').style(contextStyle)

    ws.cell(2, 1, 16, (incomeLiquidityTypes.length || -1) + (expenseLiquidityTypes.length || -1) + 4).style({
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
    const yearMoment = moment(`${year}/${month + 1}/1`)
    const {rows} = await DocumentService.query(transaction, {
      generatedAtFrom: yearMoment.toDate(),
      generatedAtTo: yearMoment.add(1, 'month').toDate()
    }, {pageSize: Number.MAX_SAFE_INTEGER})

    const contextStyle = wb.createStyle({
      alignment: {wrapText: true, horizontal: 'center', vertical: 'center'},
      font: {size: 12}
    })
    const ws = wb.addWorksheet(`${year}年${month + 1}月凭证列表`)
    ws.cell(1, 1, 1, 11, true).string(`${year}年${month + 1}月凭证列表`).style(contextStyle).style({font: {size: 24}});
    ['序号', '凭证号', '摘要', '项目', '收支', '收支类型', '金额', '资金渠道', '发生时间', '经办人', '备注'].forEach((item, index) => {
      ws.cell(2, index + 1).string(item).style(contextStyle)
    })

    ws.column(2).setWidth(25)
    ws.column(4).setWidth(25)
    ws.column(3).setWidth(40)
    ws.column(11).setWidth(40)

    rows.forEach((document, index) => {
      ws.cell(3 + index, 1).number(index + 1)
      ws.cell(3 + index, 2).string(document.humanReadableId).style(contextStyle)
      ws.cell(3 + index, 3).string(document.abstract).style(contextStyle)
      ws.cell(3 + index, 4).string(document.project.name).style(contextStyle)
      ws.cell(3 + index, 5).string(document.liquidityType.parentType === LiquidityParentType.INCOME && '收入' || '支出').style(contextStyle)
      ws.cell(3 + index, 6).string(document.liquidityType.type).style(contextStyle)
      ws.cell(3 + index, 7).number(document.amount / 100)
      ws.cell(3 + index, 8).string(document.financialSource.name).style(contextStyle)
      ws.cell(3 + index, 9).string(moment(document.generatedAt).format('YYYY/MM/DD')).style(contextStyle)
      ws.cell(3 + index, 10).string(document.handler).style(contextStyle)
      ws.cell(3 + index, 11).string(document.remark).style(contextStyle)
    })

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
    const yearMoment = moment(`${year}/${month + 1}/1`)
    const [{rows}, project] = await Promise.all([
      DocumentService.query(transaction, {
        generatedAtFrom: yearMoment.toDate(),
        generatedAtTo: yearMoment.add(1, 'month').toDate(),
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
    const numberStyle = wb.createStyle({
      alignment: {vertical: 'center'},
      font: {size: 12}
    })

    const ws = wb.addWorksheet(`${year}年${month + 1}月“${project.name}”项目凭证详情`)
    ws.cell(1, 1, 1, 7, true).string(`${year}年${month + 1}月“${project.name}”项目凭证详情`).style(contextStyle).style({font: {size: 24}});
    ['摘要', '类型', '金额', '凭证号', '小计', '合计'].forEach((item, index) => {
      ws.cell(2, index + 2).string(item).style(contextStyle)
    })

    ws.column(2).setWidth(25)
    ws.column(5).setWidth(40)

    const parentTypeGroup = lodash.groupBy(rows, 'liquidityType.parentType')
    parentTypeGroup[LiquidityParentType.INCOME] && parentTypeGroup[LiquidityParentType.INCOME].length !== 0
      && ws.cell(3, 1, 2 + parentTypeGroup[LiquidityParentType.INCOME].length, 1, true).string('收入').style(contextStyle)
    parentTypeGroup[LiquidityParentType.EXPENSE] && parentTypeGroup[LiquidityParentType.EXPENSE].length !== 0 &&
      ws.cell(
          3 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length, 1,
          2 + (parentTypeGroup[LiquidityParentType.INCOME] || {length: 0}).length + parentTypeGroup[LiquidityParentType.EXPENSE].length, 1,
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
          ws.cell(counter, 4).number(document.amount / 100)
          ws.cell(counter, 5).string(document.humanReadableId).style(contextStyle)
          typeTotal += document.amount
          counter++
        })
        ws.cell(typeCounter, 6).number(typeTotal / 100)
        parentTypeTotal += typeTotal
      })
      counter !== parentTypeCounter && ws.cell(parentTypeCounter, 7, counter - 1, 7, true).number(parentTypeTotal / 100).style(numberStyle)
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
