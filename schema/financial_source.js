const joi = require('joi')
const common = require('./common')

exports.financialSourceSchema = () => joi.object().keys({
  id: common.generalId(),
  name: joi.string().max(32),
  desc: joi.string().max(255),
  createdAt: joi.date(),
  updatedAt: joi.date()
})

exports.financialSourceTracker = () => joi.object().keys({
  id: common.generalId(),
  financialSourceId: common.generalId(),
  year: joi.number().positive().integer(),
  month: joi.number().positive().integer(),
  monthlyCarryoverAmount: common.money(),
  income: common.money(),
  expense: common.money(),
  balance: common.money(),
  createdAt: joi.date(),
  updatedAt: joi.date()
}).optionalKeys('id', 'financialSourceId', 'year', 'month', 'monthlyCarryoverAmount', 'income', 'expense', 'balance', 'createdAt', 'updatedAt')

