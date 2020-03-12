const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const entityDir = path.resolve(__dirname, './entities')
const passport = require('passport')
const {jwtStrategy} = require('./utils/strategy')
const {requestLogger} = require('./utils/middleware')
const NodeEnv = require('./enum/nodeEnv')
const Logger = require('./utils/logger')
const cors = require('cors')

app.use(cors())
app.use(express.json())

passport.use(jwtStrategy())
app.use(passport.initialize())
app.use(requestLogger)

fs.readdirSync(entityDir).forEach((_dir) => {
  require(`${entityDir}/${_dir}/router`).router(app)
})

const diffEnvAction = {
  [NodeEnv.Production]:
    /**
     * @param {*} err
     * @param {express.request} req
     * @param {express.response} res
     * @param {*} next
     */
    (err, req, res, next) => {
      if (err) {
        err.data || (err.data = {})
        req.user && (err.data.loginUserId = req.user.id)
        if (err.status) {
          Logger.warn(`handled error from '${req.method} ${req.originalUrl}'`, {status: err.status, message: err.message, data: err.data, request: {body: req.body, query: req.query, params: req.params}, stack: err.stack})
          res.status(err.status || 500).send({body: err.body})
        } else {
          Logger.error(`unhandled error from '${req.method} ${req.originalUrl}'`, err)
          Logger.error(`unhandled error addition info from '${req.method} ${req.originalUrl}'`, {request: {body: req.body, query: req.query, params: req.params}})
          res.status(500).send({body: err.body})
        }
      }
    },
  default:
    /**
     * @param {*} err
     * @param {express.request} req
     * @param {express.response} res
     * @param {*} next
     */
    (err, req, res, next) => {
      if (err) {
        err.data || (err.data = {})
        req.user && (err.data.loginUserId = req.user.id)
        if (err.status) {
          Logger.warn(`handled error from '${req.method} ${req.originalUrl}'`, {status: err.status, message: err.message, data: err.data, request: {body: req.body, query: req.query, params: req.params}, stack: err.stack})
          res.status(err.status).send({
            message: err.message,
            data: err.data,
            body: err.body
          })
        } else {
          Logger.error(`unhandled error from '${req.method} ${req.originalUrl}'`, err)
          Logger.error(`unhandled error addition info from '${req.method} ${req.originalUrl}'`, {request: {body: req.body, query: req.query, params: req.params}})
          res.status(500).send({
            message: err.message,
            data: err.data,
            body: err.body
          })
        }
      }
    }
}

app.use(diffEnvAction[process.env.NODE_ENV] || diffEnvAction.default)

module.exports = app
