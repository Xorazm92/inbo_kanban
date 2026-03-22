---
description: How to set up and run the NBT-Tasker Trello clone project
---

// turbo-all

## Prerequisites
- Node.js installed
- Expo Go app on your device
- Supabase account with project created
- Clerk account with application created

## Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp DUMMY.env .env.local
```

3. Fill in `.env.local` with your API keys:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

4. Run the combined SQL setup in Supabase SQL Editor:
- Open `sql/combined_setup.sql`
- Copy the entire contents
- Paste into Supabase Dashboard → SQL Editor → Run

5. Create a storage bucket named `files` in Supabase Dashboard → Storage

6. Enable Realtime for `cards` and `lists` tables in Supabase Dashboard → Database

7. Set up Clerk webhook (optional):
- Clerk Dashboard → Webhooks → Create
- URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-user`
- Events: `user.created`, `user.updated`

8. Deploy Supabase Edge Functions:
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy create-user --no-verify-jwt
npx supabase functions deploy push
```

9. Set Supabase secrets:
```bash
npx supabase secrets set EXPO_ACCESS_TOKEN=your_expo_token
```

10. Start the development server:
```bash
npm start
```

11. Scan QR code with Expo Go app on your device
