const joi = require('joi')
const commonSchemas = require('./common')
const projectSchemas = require('./project')
const financialSourceSchemas = require('./financial_source')

exports.document = () => joi.object().keys({
  id: commonSchemas.generalId(),
  projectId: commonSchemas.generalId(),
  financialSourceId: commonSchemas.generalId(),
  humanReadableId: joi.string().max(64),
  abstract: joi.string().max(128),
  liquidityTypeId: commonSchemas.generalId(),
  amount: commonSchemas.money().min(0),
  generatedAt: joi.date(),
  handler: joi.string().max(32).allow(''),
  remark: joi.string().max(256).allow(''),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  liquidityType: projectSchemas.liquidityTypeSchema(),
  project: projectSchemas.projectSchema(),
  financialSource: financialSourceSchemas.financialSourceSchema()
}).optionalKeys('id', 'projectId', 'financialSourceId', 'humanReadableId', 'abstract',
    'liquidityTypeId', 'amount', 'generatedAt', 'handler', 'remark', 'createdAt', 'updatedAt')
