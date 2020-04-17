const joi = require('joi')
const common = require('./common')

exports.financialSourceSchema = () => joi.object().keys({
  id: common.generalId(),
  name: joi.string().max(32),
  desc: joi.string().max(255).allow(''),
  initialStock: common.money().min(0),
  createdAt: joi.date(),
  updatedAt: joi.date()
})

exports.financialMonthlyStatistics = () => joi.object().keys({
  monthlyCarryoverAmount: common.money(),
  income: common.money(),
  expense: common.money(),
  balance: common.money()
})
