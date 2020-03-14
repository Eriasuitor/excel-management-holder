const joi = require('joi')
const DocumentController = require('./controller')
const {validateSchemas, validateSchemasAndSetTrans} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const {documentSchemas, commonSchemas} = require('../../schema/index')

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
}
