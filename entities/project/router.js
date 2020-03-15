const joi = require('joi')
const ProjectController = require('./controller')
const {validateSchemas, validateSchemasAndSetTrans} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const {projectSchemas, commonSchemas} = require('../../schema/index')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.post(
      '/projects',
      validateSchemasAndSetTrans({
        schema: projectSchemas.projectSchema().requiredKeys('name').forbiddenKeys('id', 'createdAt', 'updatedAt').optionalKeys('desc')
      },
      ProjectController.add,
      {
        schema: joi.any()
      },
      201
      )
  )

  app.put(
      '/projects/:id',
      validateSchemasAndSetTrans({
        schema: projectSchemas.projectSchema().forbiddenKeys('id', 'createdAt', 'updatedAt')
      },
      ProjectController.update,
      {
        schema: joi.any()
      }
      )
  )

  app.delete(
      '/projects/:id',
      validateSchemas({
        schema: joi.any()
      },
      ProjectController.remove,
      {
        schema: joi.any()
      },
      204
      )
  )

  app.get(
      '/projects',
      validateSchemas({
        schema: commonSchemas.pageAndOrder().unknown(true),
        apiOptions: {queryMode: true}
      },
      ProjectController.query,
      {
        schema: commonSchemas.queryResult(projectSchemas.projectSchema())
      }
      )
  )

  app.post(
      '/projects/:projectId/liquidity-types',
      validateSchemasAndSetTrans({
        schema: projectSchemas.liquidityTypeSchema().requiredKeys('parentType', 'type').forbiddenKeys('id', 'projectId', 'createdAt', 'updatedAt')
      },
      ProjectController.addLiquidityType,
      {
        schema: joi.any()
      },
      201
      )
  )

  app.put(
      '/projects/:projectId/liquidity-types/:liquidityTypeId',
      validateSchemasAndSetTrans({
        schema: projectSchemas.liquidityTypeSchema().requiredKeys('type').forbiddenKeys('parentType', 'id', 'projectId', 'createdAt', 'updatedAt')
      },
      ProjectController.updateLiquidityType,
      {
        schema: joi.any()
      }
      )
  )

  app.delete(
      '/projects/:projectId/liquidity-types/:liquidityTypeId',
      validateSchemas({
        schema: joi.any()
      },
      ProjectController.removeLiquidityType,
      {
        schema: joi.any()
      },
      204
      )
  )
}
