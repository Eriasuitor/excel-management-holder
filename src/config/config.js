module.exports = {
  app: {
    port: 10086
  },
  jwt: {
    key: 'xxx',
    expiresIn: '1d'
  },
  database: {
    username: 'root',
    password: null,
    database: 'excel-management-holder-local',
    host: '127.0.0.1',
    dialect: 'mysql',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  },
  preference: {}
}
