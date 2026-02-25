# Athletes Table – Fuel Dashboard (Desktop Web App)

This is a private, desktop-friendly web dashboard (runs locally or deployed) for tracking:
- Player (2 players)
- Game Week
- Day label (MD, MD±)
- Advised vs Actual grams for CHO/PRO/FAT
- Auto diff + % off + traffic light status
- UEFA guidance panel (g/kg → grams using body mass)

## 1) Requirements
- Node.js 18+ (recommended 20+)
- A Supabase project (Auth + Database)

## 2) Supabase setup (SQL)
In Supabase → SQL Editor, run the SQL in `supabase/schema.sql`.

Then choose ONE:
- (Simplest) Disable RLS on the tables, OR
- Keep RLS enabled and add the policies in `supabase/rls.sql` (recommended)

## 3) Environment variables
Create `.env.local` in the project root:

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

## 4) Install + run
```bash
npm install
npm run dev
```

Open: http://localhost:3000

## 5) Deploy (optional)
Deploy to Vercel:
- New Project → Import repo / upload
- Add the same env vars
