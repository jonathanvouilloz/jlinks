/**
 * PM2 Ecosystem Configuration for Noko API
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 restart noko-api
 *   pm2 logs noko-api
 */

module.exports = {
  apps: [
    {
      name: 'noko-api',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: '/opt/noko/apps/api',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env',

      // Process management
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/noko/error.log',
      out_file: '/var/log/noko/out.log',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
