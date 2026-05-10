#!/bin/bash
# Run this from your local machine after downloading the zip
# Requires: vercel CLI installed, logged in with: vercel login

TEAM_ID="team_w1s2oIg36v8N7yQkNjEvOErb"
PROJECT_NAME="sarkarischool"

cd frontend

# Create project + deploy
vercel deploy --prod \
  --name "$PROJECT_NAME" \
  --team "$TEAM_ID" \
  --env NEXT_PUBLIC_SUPABASE_URL="https://urfzljcwduycxywyzlnt.supabase.co" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g" \
  --env NEXT_PUBLIC_API_URL="https://api.sarkarischool.in" \
  --yes

echo "Vercel deployment triggered."
