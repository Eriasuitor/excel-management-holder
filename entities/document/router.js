const joi = require('joi')
const DocumentController = require('./controller')
const {validateSchemas, validateSchemasAndSetTrans} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const {documentSchemas, commonSchemas, financialSourceSchemas} = require('../../schema/index')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.post(
      '/documents',
      validateSchemasAndSetTrans({
        schema: documentSchemas.document().requiredKeys('projectId', 'financialSourceId', 'humanReadableId', 'abstract',
            'liquidityTypeId', 'amount', 'generatedAt', 'handler', 'remark')
            .forbiddenKeys('id', 'createdAt', 'updatedAt')
            .optionalKeys('handler', 'remark')
      },
      DocumentController.add,
      {
        schema: joi.any()
      },
      201
      )
  )

  app.put(
      '/documents/:id',
      validateSchemasAndSetTrans({
        schema: documentSchemas.document().forbiddenKeys('id', 'createdAt', 'updatedAt')
      },
      DocumentController.update,
      {
        schema: joi.any()
      }
      )
  )

  app.delete(
      '/documents/:id',
      validateSchemas({
        schema: joi.any()
      },
      DocumentController.remove,
      {
        schema: joi.any()
      },
      204
      )
  )

  app.get(
      '/documents',
      validateSchemas({
        schema: commonSchemas.pageAndOrder().unknown(true),
        apiOptions: {queryMode: true}
      },
      DocumentController.query,
      {
        schema: commonSchemas.queryResult(documentSchemas.document())
      }
      )
  )

  app.get(
      '/financial-monthly-summary',
      validateSchemas({
        schema: joi.object().keys({
          year: joi.number().integer().positive(),
          month: commonSchemas.month()
        }).requiredKeys('year', 'month'),
        apiOptions: {queryMode: true}
      },
      DocumentController.queryRespectiveMonthlyStatistics,
      {
        schema: joi.array().items(
            financialSourceSchemas.financialSourceSchema().keys({
              monthlyStatistics: financialSourceSchemas.financialMonthlyStatistics()
            })
        )
      }
      )
  )
}
