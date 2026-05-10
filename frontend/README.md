# Rojgar School — Frontend

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/rojgarschool&project-name=rojgarschool&root-directory=frontend&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_API_URL&envDescription=Supabase%20and%20API%20configuration&envLink=https://github.com/YOUR_USERNAME/rojgarschool/blob/main/.env.example)

## Quick Deploy

### Environment Variables Required
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://urfzljcwduycxywyzlnt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from Supabase dashboard) |
| `NEXT_PUBLIC_API_URL` | `https://api.rojgarschool.in` |

### Manual Deploy
```bash
cd frontend
npm install
npm run build
npx vercel --prod
```
