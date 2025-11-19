# Supabase Setup Guide

This guide will help you migrate from localStorage to Supabase for better data persistence and multi-device sync.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Basic knowledge of SQL

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: Laser Tag Stats (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the region closest to you
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Run Database Schema

1. In your Supabase project dashboard, click on the "SQL Editor" tab (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase_schema.sql` from your project root
4. Paste it into the SQL editor
5. Click "Run" to execute the schema creation
6. Verify that the tables were created:
   - Click "Table Editor" in the sidebar
   - You should see: `sessions`, `players`, `pending_stats`, and `guns` tables

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, go to "Project Settings" (gear icon in sidebar)
2. Click on "API" in the settings menu
3. Copy the following values:
   - **Project URL** (under "Project API")
   - **anon/public key** (under "Project API keys")

## Step 4: Configure Your Application

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 5: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to migrate to Supabase:

1. **Before migrating**, create a backup of your localStorage data:
   - Open your browser's Developer Console (F12)
   - Run: `localStorage.getItem('laserTagStats')`
   - Copy and save this somewhere safe

2. The app will automatically detect if migration is needed and prompt you
3. Alternatively, you can manually trigger migration by importing and calling:
   ```javascript
   import { migrateLocalStorageToSupabase } from './utils/migrateToSupabase';
   await migrateLocalStorageToSupabase();
   ```

## Step 6: Verify Everything Works

1. Open your application
2. Check the browser console for any errors
3. Try creating a new session
4. Go to Supabase Table Editor and verify the session appears in the `sessions` table
5. Your data is now synced with Supabase!

## Row Level Security (RLS)

The current setup allows public access to all tables. This is fine for development, but for production you should:

1. Enable authentication (Supabase Auth)
2. Update the RLS policies to restrict access based on user authentication
3. See Supabase documentation: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

## Features Enabled

With Supabase, you now have:

- **Persistent cloud storage** - Data survives browser clears and device changes
- **Multi-device sync** - Access your data from any device
- **Better performance** - PostgreSQL is more performant than localStorage for large datasets
- **Real-time updates** (optional) - Can be enabled for live collaboration
- **Backup & recovery** - Automatic backups by Supabase
- **Scalability** - Can handle much more data than localStorage

## Troubleshooting

### Error: "Failed to load data from Supabase"

- Check that your `.env` file has the correct credentials
- Verify the database schema was created correctly
- Check browser console for specific error messages
- The app will automatically fall back to localStorage if Supabase is unavailable

### Error: "relation does not exist"

- Make sure you ran the `supabase_schema.sql` script completely
- Check that all tables were created in the Table Editor

### Data not syncing

- Check browser console for errors
- Verify your API key is correct
- Check Supabase project logs for any issues
- Ensure your internet connection is stable

### Migration issues

- Always create a backup first using the browser console method above
- Check that the localStorage key `laserTagStats` exists
- Review migration errors in the browser console

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

For application issues:
- Check the browser console for errors
- Review the logs in Supabase dashboard
