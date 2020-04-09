const joi = require('joi')

exports.generalId = () => joi.number().integer().positive().description('General id generated by mysql auto increment')

exports.pageAndOrder = () => joi.object().keys({
  orderBy: joi.string(),
  isDesc: joi.boolean(),
  page: joi.number().default(1),
  pageSize: joi.number().default(10)
}).unknown(true)

exports.queryResult = (rowSchema) => joi.object().keys({
  count: joi.number().integer().min(0),
  rows: joi.array().items(rowSchema)
})

exports.money = () => joi.number().integer()

exports.month = () => joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
