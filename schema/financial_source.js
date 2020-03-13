const joi = require('joi')
const common = require('./common')

exports.financialSourceSchema = () => joi.object().keys({
  id: common.generalId(),
  name: joi.string().max(32),
  desc: joi.string().max(255),
  createdAt: joi.date(),
  updatedAt: joi.date()
})
