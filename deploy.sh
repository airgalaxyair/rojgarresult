#!/bin/bash
set -e

echo "======================================================"
echo "  SARKARI SCHOOL — Full Deployment Script"
echo "======================================================"

# ─── STEP 1: Frontend → Vercel ────────────────────────────
echo ""
echo "→ Step 1: Deploying frontend to Vercel..."
cd /home/claude/frontend

# Build first
npm run build

# Deploy to Vercel (requires VERCEL_TOKEN env var or prior login)
# Get token from: https://vercel.com/account/tokens
if [ -z "$VERCEL_TOKEN" ]; then
  echo "  Logging into Vercel interactively..."
  vercel login
  vercel deploy --prod --team airgalaxyairs-projects --yes
else
  vercel deploy --prod --token "$VERCEL_TOKEN" --team airgalaxyairs-projects --yes
fi

echo "✅ Frontend deployed to Vercel"

# ─── STEP 2: Backend → Oracle VM ──────────────────────────
echo ""
echo "→ Step 2: Backend server setup..."
echo ""
echo "  Copy these commands to your Oracle Cloud VM:"
echo ""
cat << 'SSHEOF'
  # On Oracle VM (Ubuntu 22.04):

  # Install dependencies
  sudo apt update && sudo apt install -y python3-pip python3-venv nginx certbot python3-certbot-nginx nodejs npm

  # Clone repo
  git clone https://github.com/YOUR_USERNAME/sarkarischool.git /home/ubuntu/sarkarischool

  # Backend setup
  cd /home/ubuntu/sarkarischool/backend
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt

  # Copy .env
  cp .env.example .env
  # → Edit .env with your actual values: nano .env

  # PM2 setup
  sudo npm install -g pm2
  cd /home/ubuntu/sarkarischool
  pm2 start infra/ecosystem.config.js
  pm2 save
  pm2 startup

  # Nginx
  sudo cp infra/nginx.conf /etc/nginx/sites-available/sarkarischool
  sudo ln -s /etc/nginx/sites-available/sarkarischool /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx

  # SSL
  sudo certbot --nginx -d api.sarkarischool.in

SSHEOF

echo "======================================================"
echo "  DEPLOYMENT COMPLETE"
echo "======================================================"
