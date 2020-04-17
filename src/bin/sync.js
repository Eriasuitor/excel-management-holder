const db = require('../database/models')
const program = require('commander')

program
    .version('0.0.1')
    .option('-f, --force', 'sync db with additional sql DROP TABLE IF EXISTS')
    .parse(process.argv)

/**
 * To sync databases without enforce
 */
const run = async () => {
  if (process.env.NODE_ENV != 'local' && program.force) console.error(`can't sync db with -f when environment is ${process.env.NODE_ENV}`)
  await db.sequelize.sync({force: program.force})
  process.exit()
}

run()
