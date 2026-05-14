module.exports = {
  apps: [
    {
      name: "silvia-frontend",
      cwd: "/root/web-silvia-next/Frontend", // ajustar al path real en el servidor
      script: "npm",
      args: "start",
      exec_mode: "cluster",
      instances: 2,
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    },
    {
      name: "silvia-backend",
      cwd: "/root/SilviaFernandez/Backend", // ajustar al path real en el servidor
      script: "index.js",
      interpreter: "node",
      exec_mode: "cluster",
      instances: 2,
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
