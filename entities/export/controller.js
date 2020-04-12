const ExportService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const sqlTool = require('../../utils/sqlTool')
const xl = require('excel4node')

module.exports = class {
  /**
   * @param {express.request} req
   * @param {express.response} res
   * @param {*} next
   */
  static async handler(req, res, next) {
    try {
      const {filename, worksheets} = req.body
      const wb = new xl.Workbook()
      for (const worksheetOpt of worksheets) {
        await ExportService[worksheetOpt.type](req.transaction, worksheetOpt, {wb})
      }
      await wb.write(`${filename}.xlsx`, res)
    } catch (error) {
      next(error)
    }
  }
}
