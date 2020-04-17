const config = require('./config')
const configProd = require('./config_prod')
const configAudit = require('./config_audit')
const configTest = require('./config_test')
const configDev = require('./config_dev')
const configLocal = require('./config_local')
const merge = require('deepmerge')
const NodeEnv = require('../enum/nodeEnv')

const diffEnvAction = {
  [NodeEnv.Local]: configLocal,
  [NodeEnv.Test]: configTest,
  [NodeEnv.Development]: configDev,
  [NodeEnv.Production]: configProd,
  [NodeEnv.Audit]: configAudit
}

const usedConfig = diffEnvAction[process.env.NODE_ENV]
if (!usedConfig) throw new Error(`config file for env ${process.env.NODE_ENV} is not found`)

module.exports = (
  /**
   * @return {config}
   */
  () => merge.all([config, usedConfig])
)()
