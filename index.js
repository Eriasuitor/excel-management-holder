// const service = require('./entities/user/controller')

const fs =require('fs')

const data = fs.readFileSync('./entities/user/controller.js').toString()

const position = data.lastIndexOf('}')

console.log(`${data.slice(0, position)}
  /**
   * @param {express.request} req
   */
  static async getUserInfo(req) {
    return req.user
  }
${data.slice(position, data.length)}`)
