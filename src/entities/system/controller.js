const UserService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')

module.exports = class {
  /**
   * @param {express.request} req
   */
  static async getInfo(req) {
    return {
      env: process.env.NODE_ENV
    }
  }
}
