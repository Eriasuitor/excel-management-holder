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

  app.get(
      '/financial-sources/:sourceId/trackers',
      validateSchemas({
        schema: commonSchemas.pageAndOrder(),
        apiOptions: {queryMode: true}
      },
      FinancialSourceController.queryTracker,
      {
        schema: commonSchemas.queryResult(financialSourceSchemas.financialSourceTracker())
      }
      )
  )

  app.get(
      '/financial-sources/all/trackers/annual-counter',
      validateSchemas({
        schema: joi.object().keys({
          year: joi.number().integer().positive()
        }).requiredKeys('year'),
        apiOptions: {queryMode: true}
      },
      FinancialSourceController.queryTrackerAnnualCounter,
      {
        schema: joi.array().items(joi.object().keys({
          month: joi.number().integer().min(1),
          count: joi.number().integer().min(0)
        }))
      }
      )
  )


  app.post(
      '/financial-sources/:financialSourceId/flows',
      validateSchemasAndSetTrans({
        schema: financialSourceSchemas.financialFlow()
            .requiredKeys('abstract', 'humanReadableId', 'incomeAmount', 'expenseAmount', 'balance', 'generatedAt', )
            .forbiddenKeys('financialSourceId', 'id', 'createdAt', 'updatedAt')
            .optionalKeys('remark')
      },
      FinancialSourceController.addFinancialFlow,
      {
        schema: joi.any()
      },
      201
      )
  )

  app.put(
      '/financial-sources/:financialSourceId/flows/:financialFlowId',
      validateSchemasAndSetTrans({
        schema: financialSourceSchemas.financialFlow().forbiddenKeys('id', 'createdAt', 'updatedAt')
      },
      FinancialSourceController.updateFinancialFlow,
      {
        schema: joi.any()
      }
      )
  )

  app.delete(
      '/financial-sources/:financialSourceId/flows/:financialFlowId',
      validateSchemas({
        schema: joi.any()
      },
      FinancialSourceController.removeFinancialFlow,
      {
        schema: joi.any()
      },
      204
      )
  )

  app.get(
      '/financial-sources/:financialSourceId/flows',
      validateSchemas({
        schema: commonSchemas.pageAndOrder().unknown(true),
        apiOptions: {queryMode: true}
      },
      FinancialSourceController.queryFinancialFlow,
      {
        schema: commonSchemas.queryResult(financialSourceSchemas.financialFlow())
      }
      )
  )
}
