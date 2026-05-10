module.exports = {
  apps: [
    {
      name: "sarkari-api",
      script: "uvicorn",
      args: "main:app --host 0.0.0.0 --port 8000 --workers 2",
      cwd: "/home/ubuntu/sarkarischool/backend",
      interpreter: "python3",
      env: {
        ENVIRONMENT: "production",
        PYTHONPATH: "/home/ubuntu/sarkarischool/backend",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "/var/log/sarkari/api-error.log",
      out_file: "/var/log/sarkari/api-out.log",
      time: true,
    },
    {
      name: "sarkari-scrapers",
      script: "python3",
      args: "-m scheduler.scheduler",
      cwd: "/home/ubuntu/sarkarischool/backend",
      env: {
        ENVIRONMENT: "production",
        PYTHONPATH: "/home/ubuntu/sarkarischool/backend",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "/var/log/sarkari/scrapers-error.log",
      out_file: "/var/log/sarkari/scrapers-out.log",
      time: true,
      // Restart if scraper dies
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
    },
  ],
};
