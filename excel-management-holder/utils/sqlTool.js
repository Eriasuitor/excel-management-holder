const db = require('../database/models')

exports.abstractQueryInf = (query) => {
  const {pageSize, page, orderBy, isDesc} = query
  delete query.pageSize
  delete query.page
  delete query.orderBy
  delete query.isDesc
  return {pageSize, page, orderBy, isDesc}
}

exports.resolveSequelizePageAndOrder = ({pageSize = 10, page = 1, orderBy, isDesc} = {}) => {
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: orderBy ? [[orderBy, isDesc ? 'DESC' : 'ASC']] : []
  }
}

const selectConditionKeywordsHandlers = Object.freeze([
  Object.freeze({suffix: 'In', formatter: (key, values) => `${key.slice(0, key.length - 2)} IN (${values.map((value) => `"${value}"`).join(', ')})`}),
  Object.freeze({suffix: 'Match', formatter: (key, value) => `MATCH (${key.slice(0, key.length - 5)}) AGAINST ('${value}' IN BOOLEAN MODE)`}),
  Object.freeze({suffix: 'From', formatter: (key, value) => `${key.slice(0, key.length - 4)} >= "${value}"`}),
  Object.freeze({suffix: 'To', formatter: (key, value) => `${key.slice(0, key.length - 2)} <= "${value}"`}),
  Object.freeze({suffix: 'IsNull', formatter: (key, value) => `${key.slice(0, key.length - 6)} IS ${value ? '' : 'NOT'} NULL`}),
  Object.freeze({suffix: 'Not', formatter: (key, value) => `${key.slice(0, key.length - 3)} != ${value}`}),
  Object.freeze({suffix: 'Like', formatter: (key, value) => `${key.slice(0, key.length - 4)} LIKE ${value}%`})
])

exports.resolveSelectConditionSql = (condition) => {
  const whereSqlList = []
  Object.keys(condition).forEach((key) => {
    for (const handler of selectConditionKeywordsHandlers) {
      if (key.endsWith(handler.suffix)) {
        whereSqlList.push(handler.formatter(key, condition[key]))
        continue
      }
    }
    whereSqlList.push(`${key} = ${condition[key]}`)
  })
  return whereSqlList.join(' AND ')
}

const selectConditionKeywordsSequelizeHandlers = Object.freeze([
  Object.freeze({
    suffix: 'In',
    formatter: (key, values, reference) => ({[`${key.slice(0, key.length - 2)}`]: {[db.Op.in]: values}})
  }),
  Object.freeze({
    suffix: 'Match',
    formatter: (key, value, reference) =>
      db.Sequelize.literal(`MATCH (${reference? `${reference}.`: ''}${key.slice(0, key.length - 5)}) AGAINST ('${value}' IN BOOLEAN MODE)`)
  }),
  Object.freeze({
    suffix: 'From',
    formatter: (key, value, reference) => ({[`${key.slice(0, key.length - 4)}`]: {[db.Op.gte]: value}})
  }),
  Object.freeze({
    suffix: 'To',
    formatter: (key, value, reference) => ({[`${key.slice(0, key.length - 2)}`]: {[db.Op.lte]: value}})
  }),
  Object.freeze({
    suffix: 'IsNull',
    formatter: (key, value, reference) => ({[`${key.slice(0, key.length - 6)}`]: [true, 'true'].includes(value)? null: {[db.Op.not]: null}})
  }),
  Object.freeze({
    suffix: 'Not',
    formatter: (key, value, reference) => ({[`${key.slice(0, key.length - 3)}`]: {[db.Op.not]: value}})
  }),
  Object.freeze({
    suffix: 'Like',
    formatter: (key, value, reference) => ({[`${key.slice(0, key.length - 4)}`]: {[db.Op.like]: `${value}%`}})
  })
])

exports.resolveSequelizeSelectCondition = (condition, reference) => {
  const whereObjectList = []
  Object.keys(condition).forEach((key) => {
    let pureField = true
    for (const handler of selectConditionKeywordsSequelizeHandlers) {
      if (key.endsWith(handler.suffix)) {
        whereObjectList.push(handler.formatter(key, condition[key], reference))
        pureField = false
        break
      }
    }
    pureField && whereObjectList.push({[key]: condition[key]})
  })
  return {[db.Op.and]: whereObjectList}
}
