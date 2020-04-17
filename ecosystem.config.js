module.exports = {
  apps: [{
    name: 'excel-management-holder',
    script: 'src/bin/start.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    env_audit: {
      NODE_ENV: 'audit'
    }
  }]
}
