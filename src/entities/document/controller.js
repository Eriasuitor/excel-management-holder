const DocumentService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const sqlTool = require('../../utils/sqlTool')

module.exports = class {
  /**
   * @param {express.request} req
   */
  static async add(req) {
    return DocumentService.add(req.transaction, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async update(req) {
    const {id} = req.params
    return DocumentService.update(req.transaction, id, req.body)
  }

  /**
   * @param {express.request} req
   */
  static async remove(req) {
    const {id} = req.params
    await DocumentService.remove(undefined, id)
    return
  }

  /**
   * @param {express.request} req
   */
  static async query(req) {
    const pageAndOrder = sqlTool.abstractQueryInf(req.query)
    return DocumentService.query(undefined, req.query, pageAndOrder)
  }

  /**
   * @param {express.request} req
   */
  static async queryRespectiveMonthlyStatistics(req) {
    const {year, month} = req.query
    return DocumentService.queryRespectiveMonthlyStatistics(undefined, year, month)
  }
}
