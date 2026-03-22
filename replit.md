# INBO — Trello Clone

A React Native / Expo Trello-like task management app with real-time collaboration, built with Expo Router, Clerk authentication, and Supabase backend.

## Tech Stack

- **Framework**: Expo (SDK 51) + Expo Router (file-based routing)
- **Platform**: React Native Web (runs on web at port 5000) + iOS/Android
- **Auth**: Clerk (`@clerk/clerk-expo` + `@clerk/clerk-react` for web)
- **Database/Backend**: Supabase (PostgreSQL + Realtime + Storage + Edge Functions)
- **UI**: React Native StyleSheet, `@expo/vector-icons`, `@gorhom/bottom-sheet`, `zeego`
- **Drag & Drop**: `react-native-draggable-flatlist`
- **Push Notifications**: Expo Notifications + Supabase Edge Functions
- **Theme**: Dark/Light mode via `useColorScheme`

## Required Environment Variables

Set these in Replit Secrets:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (starts with `pk_test_` or `pk_live_`)
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL (`https://xxxx.supabase.co`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Project Structure

```
app/
  _layout.tsx                    # Root layout (Clerk + Supabase providers)
  index.tsx                      # Landing/login page
  oauth-native-callback.tsx      # OAuth callback handler
  (authenticated)/
    _layout.tsx                  # Authenticated stack layout + push notifications
    (tabs)/
      _layout.tsx                # Bottom tab bar
      boards/
        index.tsx                # Board list (main screen)
        new-board/               # Create board flow
        templates.tsx            # Board templates
      my-cards.tsx               # Cards assigned to current user
      search.tsx                 # User search (invite to boards)
      notifications.tsx          # Push notification history
      account.tsx                # User profile + sign out
    board/
      [id].tsx                   # Board view with lists
      settings.tsx               # Board settings (rename, members, delete)
      invite.tsx                 # Invite members to board
      card/[id].tsx              # Card detail (description, checklist, comments, assign)

components/
  AuthModal.tsx                  # Login/signup bottom sheet (OAuth providers)
  Board/
    BoardArea.tsx                # Horizontal scrollable board canvas
    ListView.tsx                 # Column (list) with drag-and-drop cards
    ListItem.tsx                 # Individual card card
    ListStart.tsx                # New list creation form
    CarouselWrapper.tsx          # Web carousel wrapper
  DropdownPlus.tsx               # + button dropdown (new board/card/templates)
  UserListItem.tsx               # User row for member lists

context/
  ClerkContext.tsx               # Clerk provider (native)
  ClerkContext.web.tsx           # Clerk provider (web, uses @clerk/clerk-react)
  SupabaseContext.tsx            # All Supabase CRUD operations

utils/
  supabaseClient.ts              # Supabase client with Clerk JWT injection

sql/
  tables.sql                     # Database schema
  security.sql                   # Row Level Security policies
  search.sql                     # search_users RPC function
  trigger.sql                    # DB triggers
  notifications.sql              # Notifications table
  storage.sql                    # Storage bucket policies
  combined_setup.sql             # All SQL combined

supabase/
  functions/                     # Edge functions (push notifications)
  migrations/                    # Supabase migrations
```

## Features

- **Boards**: Create, rename, delete boards with custom background colors
- **Lists/Columns**: Add, rename, delete lists within a board
- **Cards**: Create, edit, assign, archive cards with drag-and-drop reordering
- **Real-time**: Supabase Realtime subscription updates cards live across clients
- **File Attachments**: Upload images to cards via Supabase Storage
- **Checklists**: Add sub-tasks to cards with progress tracking
- **Comments**: Add comments to cards
- **Member Management**: Invite users to boards, assign cards to members
- **Notifications**: Push notifications via Expo + Supabase Edge Functions
- **Theme**: Automatic dark/light mode

## Running

The app runs via the "Start application" workflow on port 5000.
Command: `EXPO_PUBLIC_PORT=5000 npx expo start --web --port 5000 --no-dev`

## Supabase Setup

Run the SQL files in `sql/` directory against your Supabase project:
1. `tables.sql` — Create all tables
2. `security.sql` — Enable RLS policies
3. `search.sql` — Create search_users function
4. `trigger.sql` — Set up DB triggers
5. `notifications.sql` — Notifications table
6. `storage.sql` — Storage bucket config

Also configure a Clerk JWT template named `supabase` in your Clerk Dashboard.
