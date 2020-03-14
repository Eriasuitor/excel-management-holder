const FinancialSourcesService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  /**
   * @param {express.request} req
   */
  static async add(req) {
    return FinancialSourcesService.add(req.transaction, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async update(req) {
    const {id} = req.params
    return FinancialSourcesService.update(req.transaction, id, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async remove(req) {
    const {id} = req.params
    await FinancialSourcesService.remove(undefined, id)
    return
  }

  /**
   * @param {express.request} req
   */
  static async query(req) {
    const pageAndOrder = sqlTool.abstractQueryInf(req.query)
    return FinancialSourcesService.query(undefined, req.query, pageAndOrder)
  }

  /**
   * @param {express.request} req
   */
  static async addOrUpdateTracker(req) {
    const {sourceId} = req.params
    req.body.financialSourceId = sourceId
    return FinancialSourcesService.addOrUpdateTracker(req.transaction, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async removeTracker(req) {
    const {trackerId} = req.params
    await FinancialSourcesService.removeTracker(req.transaction, trackerId)
    return
  }

  /**
   * @param {express.request} req
   */
  static async queryTracker(req) {
    const {sourceId} = req.params
    const pageAndOrder = sqlTool.abstractQueryInf(req.query)
    req.query.financialSourceId = sourceId
    return FinancialSourcesService.queryTracker(req.transaction, req.query, pageAndOrder)
  }

  /**
   * @param {express.request} req
   */
  static async addFinancialFlow(req) {
    const {financialSourceId} = req.params
    req.body.financialSourceId = financialSourceId
    return FinancialSourcesService.addFinancialFlow(req.transaction, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async updateFinancialFlow(req) {
    const {financialFlowId} = req.params
    return FinancialSourcesService.updateFinancialFlow(req.transaction, financialFlowId, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async removeFinancialFlow(req) {
    const {financialFlowId} = req.params
    await FinancialSourcesService.removeFinancialFlow(req.transaction, financialFlowId)
    return
  }

  /**
   * @param {express.request} req
   */
  static async queryFinancialFlow(req) {
    const {financialSourceId} = req.params
    req.body.financialSourceId = financialSourceId
    const pageAndOrder = sqlTool.abstractQueryInf(req.query)
    return FinancialSourcesService.queryFinancialFlow(req.transaction, req.query, pageAndOrder)
  }
}
