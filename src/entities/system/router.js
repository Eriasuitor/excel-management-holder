const joi = require('joi')
const SystemController = require('./controller')
const {validateSchemas} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const NodeEnv = require('../../enum/nodeEnv')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.get(
      '/system/info',
      validateSchemas({
        schema: joi.any()
      },
      SystemController.getInfo,
      {
        schema: joi.object().keys({
          env: joi.string().valid(Object.values(NodeEnv))
        })
      }
      )
  )
}
