const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const fecha = require('fecha')
const {combine, timestamp, printf} = winston.format

const logger = winston.createLogger({
  level: 'debug',
  format: combine(
      timestamp({format: fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS')}),
      printf(({level, info, timestamp, data}) => {
        if (data instanceof Error) {
          return `[${timestamp}] ${level}: [${info}] ${data.stack}`
        }
        return `[${timestamp}] ${level}: [${info}] ${JSON.stringify(data)}`
      })
  ),
  transports: [
    new DailyRotateFile({
      dirname: 'logs',
      filename: '%DATE%.log'
    })
  ]
})

/**
 *
 * @param {*} level
 * @param {*} info
 * @param {*} data
 */
function _log(level, info, data) {
  logger.log({info, data, level})
}

/**
 * @param {string} info
 * @param {JSON} data
 */
exports.debug = (info, data) => {
  _log('debug', info, data)
}
/**
 * @param {string} info
 * @param {JSON} data
 */
exports.info = (info, data) => {
  _log('info', info, data)
}
/**
 * @param {string} info
 * @param {JSON} data
 */
exports.error = (info, data) => {
  _log('error', info, data)
}
/**
 * @param {string} info
 * @param {JSON} data
 */
exports.warn = (info, data) => {
  _log('warn', info, data)
}
