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
        schema: financialSourceSchemas.financialSourceSchema().requiredKeys('name').forbiddenKeys('id', 'createdAt', 'updatedAt')
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
        schema: financialSourceSchemas.financialSourceSchema().forbiddenKeys('id', 'createdAt', 'updatedAt')
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

  app.post(
      '/financial-sources/:sourceId/trackers',
      validateSchemasAndSetTrans({
        schema: financialSourceSchemas.financialSourceTracker()
            .requiredKeys('year', 'month', 'monthlyCarryoverAmount', 'income', 'expense', 'balance')
            .forbiddenKeys('id', 'financialSourceId', 'updatedAt', 'createdAt')
      },
      FinancialSourceController.addOrUpdateTracker,
      {
        schema: joi.any()
      },
      201
      )
  )

  app.delete(
      '/financial-sources/:sourceId/trackers/:trackerId',
      validateSchemas({
        schema: joi.any()
      },
      FinancialSourceController.removeTracker,
      {
        schema: joi.any()
      },
      204
      )
  )

  app.get(
      '/financial-sources/:sourceId/trackers',
      validateSchemas({
        schema: commonSchemas.pageAndOrder()
      },
      FinancialSourceController.queryTracker,
      {
        schema: commonSchemas.queryResult(financialSourceSchemas.financialSourceTracker())
      }
      )
  )
}
