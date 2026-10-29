module.exports = {
  apps: [
    {
      name: "app-souls-dev",
      cwd: "/opt/apps/app-souls-dev",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3001",
      env: {
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      max_memory_restart: "900M",
      time: true,
    },
  ],
};
