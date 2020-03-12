const UserService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')

module.exports = class {
  /**
   * @param {express.request} req
   */
  static async login(req) {
    const {userId, password} = req.body
    return UserService.login(userId, password)
  }

  /**
   * @param {express.request} req
   */
  static async getUserInfo(req) {
    return req.user
  }
}
