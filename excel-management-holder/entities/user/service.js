const {superError} = require('../../utils/error')
const {jwtSign} = require('../../utils/strategy')
const Role = require('../../enum/role')

module.exports = class {
  static async login(userId, password) {
    if (password !== `${userId}'s_password`) {
      superError(401, 'user not found or password wrong').throw()
    }
    const userInfo = {id: userId, roles: [Role.User]}
    const token = jwtSign(userInfo)
    return {token, userInfo}
  }
}
