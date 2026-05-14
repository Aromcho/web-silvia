module.exports = {
  apps: [
    {
      name: "silvia-frontend",
      cwd: "/root/web-silvia/Frontend", // ajustar al path real en el servidor
      script: "npm",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "development",
        PORT: 8080
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    },
    {
      name: "silvia-backend",
      cwd: "/root/web-silvia/Backend", // ajustar al path real en el servidor
      script: "index.js",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};
