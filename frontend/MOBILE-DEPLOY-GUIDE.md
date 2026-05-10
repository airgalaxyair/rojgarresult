# Sarkari School — Mobile Deployment Guide
## Deploy from Your Phone in 15 Minutes

---

## What's Already Done (You Don't Touch These)
- ✅ Supabase database created (Mumbai server)
- ✅ All 15 tables created with indexes
- ✅ 50 departments, 36 states, 10 categories seeded
- ✅ 8 sample posts live
- ✅ Admin account created

---

## Step 1 — Create GitHub Account (2 min)
1. Open **github.com** on your phone browser
2. Tap **Sign up**
3. Enter email, password, username
4. Verify email
5. Done — you're logged in

---

## Step 2 — Create New Repository (1 min)
1. On GitHub, tap the **+** icon (top right)
2. Tap **New repository**
3. Name it: `sarkarischool`
4. Set to **Public**
5. Tap **Create repository**

---

## Step 3 — Upload the Code (3 min)
1. On the empty repo page, tap **uploading an existing file**
2. Download the zip I provided: `sarkarischool-github.zip`
3. **Unzip it** on your phone (use Files app on iPhone or any file manager on Android)
4. Tap **choose your files** on GitHub
5. Select ALL files from the unzipped folder
6. Scroll down, tap **Commit changes**
7. Wait ~10 seconds — files are now on GitHub ✅

---

## Step 4 — Connect Vercel (3 min)
1. Open **vercel.com** on your phone
2. Tap **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access GitHub
4. Tap **Add New Project**
5. Find `sarkarischool` in the list → tap **Import**
6. Vercel auto-detects Next.js ✅

---

## Step 5 — Add Environment Variables in Vercel (2 min)
Before deploying, add these 3 variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://urfzljcwduycxywyzlnt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g` |
| `NEXT_PUBLIC_API_URL` | `https://api.sarkarischool.in` |

How to add:
1. On the Vercel project setup page, scroll to **Environment Variables**
2. Add each one above (Name + Value)
3. Make sure all 3 are set
4. Tap **Deploy** 🚀

---

## Step 6 — Wait for Deploy (2 min)
- Vercel builds automatically
- Takes about 2 minutes
- You'll see a **green checkmark** when done
- Tap **Visit** to see your live site ✅

---

## Step 7 — Set Up Auto-Deploy (GitHub Actions) (2 min)
So future changes deploy automatically:

1. In Vercel → **Account Settings** → **Tokens**
2. Tap **Create Token**, name it `github-actions`, copy it
3. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
4. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | (paste token from step 2) |
| `VERCEL_ORG_ID` | `team_w1s2oIg36v8N7yQkNjEvOErb` |
| `VERCEL_PROJECT_ID` | (get from Vercel → Project → Settings → General) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://urfzljcwduycxywyzlnt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g` |
| `NEXT_PUBLIC_API_URL` | `https://api.sarkarischool.in` |

Now every time you push code to GitHub → site auto-updates ✅

---

## Step 8 — Add Your Domain (Optional, 2 min)
1. Vercel → Project → **Settings** → **Domains**
2. Type `sarkarischool.in` → **Add**
3. Vercel shows you DNS records
4. Go to your domain registrar → add those records
5. Done — site is live on your domain ✅

---

## Admin Panel Access
Once deployed, go to:
`https://your-vercel-url.vercel.app/admin`

Login:
- Email: `admin@sarkarischool.in`
- Password: `SarkariSchool@2025!`
- **Change this immediately after first login**

---

## Supabase Dashboard
View your database at:
`https://supabase.com/dashboard/project/urfzljcwduycxywyzlnt`

---

## Backend (Scrapers) — Later
The backend scrapers require a server (Oracle Cloud Free VM).
This can be set up later from a laptop or by someone else.
The frontend works completely standalone right now — it serves the 8 sample posts from Supabase.

---

## Summary
| Service | Status | Cost |
|---------|--------|------|
| Supabase (database) | ✅ Live | Free |
| Vercel (frontend) | After Step 6 | Free |
| Domain | Optional | ~₹800/year |
| Backend/scrapers | Later | Free (Oracle VM) |
