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

exports.financialFlow = () => joi.object().keys({
  id: common.generalId(),
  financialSourceId: common.generalId(),
  abstract: joi.string().max(128),
  humanReadableId: joi.string().max(64),
  incomeAmount: common.money().min(0),
  expenseAmount: common.money().min(0),
  balance: common.money(),
  generatedAt: joi.date(),
  remark: joi.string().max(256).allow(''),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  financialSource: exports.financialSourceSchema()
}).optionalKeys('id', 'financialSourceId', 'abstract', 'humanReadableId', 'incomeAmount', 'expenseAmount',
    'balance', 'generatedAt', 'remark', 'createdAt', 'updatedAt' )
