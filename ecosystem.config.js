module.exports = {
    apps: [
      {
        name: 'ui',
        cwd: './package/ui',
        script: 'npm',
        args: 'start',
        env: {
          PORT: 3000,
          NODE_ENV: 'production'
        }
      },
      {
        name: 'api',
        cwd: './package/api',
        script: 'npm',
        args: 'start',
        env: {
          PORT: 3001,
          NODE_ENV: 'production'
        }
      }
    ]
  };