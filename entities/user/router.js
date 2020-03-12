const joi = require('joi')
const UserController = require('./controller')
const {validateSchemas, validateToken, selfOnly, withRole} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const Role = require('../../enum/role')
const {userSchemas} = require('../../schema/index')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.post(
      '/login',
      validateSchemas({
        schema: userSchemas.loginInfoSchema()
      },
      UserController.login,
      {
        schema: joi.object().keys({
          token: joi.string(),
          userInfo: userSchemas.userSchema()
        }).required().requiredKeys('token', 'userInfo')
      }
      )
  )

  app.get(
      '/users/:userId',
      validateToken(),
      selfOnly(),
      withRole(Role.User),
      validateSchemas({
        schema: joi.any()
      },
      UserController.getUserInfo,
      {
        schema: userSchemas.userSchema()
      }
      )
  )
}
