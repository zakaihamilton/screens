module.exports = {
  apps : [{
    name: 'screens',
    script: './packages/code/platform/server.js',
    args: '',
    instances: "max",
    autorestart: true,
    watch: false,
    max_memory_restart: '3G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
