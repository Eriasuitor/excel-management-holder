const joi = require('joi')
const common = require('./common')

exports.document = () => joi.object().keys({
  id: common.generalId(),
  projectId: common.generalId(),
  financialSourceId: common.generalId(),
  humanReadableId: joi.string().max(64),
  abstract: joi.string().max(128),
  liquidityTypeId: common.generalId(),
  amount: common.money().min(0),
  generatedAt: joi.date(),
  handler: joi.string().max(32),
  remark: joi.string().max(256),
  createdAt: joi.date(),
  updatedAt: joi.date()
}).optionalKeys('id', 'projectId', 'financialSourceId', 'humanReadableId', 'abstract',
    'liquidityTypeId', 'amount', 'generatedAt', 'handler', 'remark', 'createdAt', 'updatedAt')
