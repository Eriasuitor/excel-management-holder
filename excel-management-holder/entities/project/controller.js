const ProjectService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  /**
   * @param {express.request} req
   */
  static async add(req) {
    return ProjectService.add(req.transaction, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async update(req) {
    const {id} = req.params
    return ProjectService.update(req.transaction, id, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async remove(req) {
    const {id} = req.params
    await ProjectService.remove(undefined, id)
    return
  }

  /**
   * @param {express.request} req
   */
  static async query(req) {
    const pageAndOrder = sqlTool.abstractQueryInf(req.query)
    return ProjectService.query(undefined, req.query, pageAndOrder)
  }

  /**
   * @param {express.request} req
   */
  static async addLiquidityType(req) {
    const {projectId} = req.params
    return ProjectService.addLiquidityType(req.transaction, projectId, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async updateLiquidityType(req) {
    const {liquidityTypeId, projectId} = req.params
    req.body.projectId = projectId
    return ProjectService.updateLiquidityType(req.transaction, liquidityTypeId, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async removeLiquidityType(req) {
    const {liquidityTypeId} = req.params
    await ProjectService.removeLiquidityType(undefined, liquidityTypeId)
    return
  }
}
