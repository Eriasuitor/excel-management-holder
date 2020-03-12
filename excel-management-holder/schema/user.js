const joi = require('joi')
const common = require('./common')
const Role = require('../enum/role')

exports.loginInfoSchema = () => joi.object().keys({
  userId: joi.number().positive().integer(),
  password: joi.string()
}).required().requiredKeys('userId', 'password')

const roleSchema = () => joi.string().valid(Object.values(Role))

exports.userSchema = () => joi.object().keys({
  id: common.generalId(),
  roles: joi.array().items(roleSchema())
})
