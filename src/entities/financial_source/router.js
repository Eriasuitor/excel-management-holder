const joi = require('joi')
const FinancialSourceController = require('./controller')
const {validateSchemas, validateSchemasAndSetTrans} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const {financialSourceSchemas, commonSchemas} = require('../../schema/index')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.post(
      '/financial-sources',
      validateSchemasAndSetTrans({
        schema: financialSourceSchemas.financialSourceSchema().requiredKeys('name', 'initialStock').forbiddenKeys('id', 'createdAt', 'updatedAt')
      },
      FinancialSourceController.add,
      {
        schema: joi.any()
      },
      201
      )
  )

  app.put(
      '/financial-sources/:id',
      validateSchemasAndSetTrans({
        schema: financialSourceSchemas.financialSourceSchema().forbiddenKeys('id', 'createdAt', 'updatedAt', 'initialStock')
      },
      FinancialSourceController.update,
      {
        schema: joi.any()
      }
      )
  )

  app.delete(
      '/financial-sources/:id',
      validateSchemas({
        schema: joi.any()
      },
      FinancialSourceController.remove,
      {
        schema: joi.any()
      },
      204
      )
  )

  app.get(
      '/financial-sources',
      validateSchemas({
        schema: commonSchemas.pageAndOrder().unknown(true),
        apiOptions: {queryMode: true}
      },
      FinancialSourceController.query,
      {
        schema: commonSchemas.queryResult(financialSourceSchemas.financialSourceSchema())
      }
      )
  )
}
