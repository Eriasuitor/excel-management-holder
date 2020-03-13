const joi = require('joi')
const common = require('./common')
const LiquidityParentType = require('../enum/liquidity_parent_type')

exports.liquidityTypeSchema = () => joi.object().keys({
  id: common.generalId(),
  projectId: common.generalId(),
  parentType: joi.string().valid(...Object.values(LiquidityParentType)),
  type: joi.string().max(32),
  createdAt: joi.date(),
  updatedAt: joi.date()
})

exports.projectSchema = () => joi.object().keys({
  id: common.generalId(),
  name: joi.string().max(32),
  desc: joi.string().max(255),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  liquidityTypes: joi.array().items(exports.liquidityTypeSchema())
})
