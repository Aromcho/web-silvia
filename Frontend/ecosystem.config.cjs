module.exports = {
  apps: [
    {
      name: "silvia-web-v2",
      script: "npm",
      args: "start",
      exec_mode: "cluster", // Modo clúster
      env: {
        NODE_ENV: "production",
        PORT: 9000
      }
    }
  ]
};

