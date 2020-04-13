const joi = require('joi')
const ExportController = require('./controller')
const {validRequest} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const {commonSchemas} = require('../../schema')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.post(
      '/exports',
      validRequest({
        schema: joi.object().keys({
          filename: joi.string(),
          worksheets: joi.array().items(
              joi.object().keys({
                name: joi.string(),
                type: joi.string().valid(
                    'annualFinance',
                    'annualProject',
                    'annualSpecifiedProject',
                    'annualSpecifiedProjectDetail',
                    'monthlyDocument',
                    'monthlyProject'
                ),
                year: joi.number().integer().positive(),
                month: commonSchemas.month(),
                projectId: commonSchemas.generalId()
              })
          ).min(1)
        })
      }),
      ExportController.handler
  )
}
