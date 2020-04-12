const xl = require('excel4node')
const DocumentService = require('../document/service')
const lodash = require('lodash')

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
    const ws = wb.addWorksheet(`${year}年年度资金表`)
    ws.cell(1, 1, 1, 15, true).string(`${year}年年度资金表`).style(contextStyle).style({font: {size: 24}})
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
    const ws = wb.addWorksheet(`${year}年年度项目收支表`)
    ws.cell(1, 1, 1, 4, true).string(`${year}年年度项目收支表`).style(contextStyle).style({font: {size: 24}})
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
}
