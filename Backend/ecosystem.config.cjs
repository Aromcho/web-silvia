module.exports = {
  apps: [
    {
      name: "silvia",
      script: "npm",
      args: "start",
      exec_mode: "cluster", // Modo clúster
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    }
  ]
};

