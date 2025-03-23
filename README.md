# vibe - Moodboard Creation App

A React/Next.js application for creating and sharing digital moodboards.

## Features Implemented

- ✅ User authentication with Supabase
- ✅ Moodboard creation and editing
- ✅ Real-time saving functionality
- ✅ Image upload and management
- ✅ Text element creation
- ✅ Drag and drop interface
- ✅ Background color customization
- ✅ Share functionality
- ✅ Export to PNG

## Current Issues to Fix

1. Authentication Flow

   - [ ] Fix redirection after sign-in
   - [ ] Improve error handling for auth state changes

2. Moodboard Management

   - [ ] Fix moodboard title update functionality
   - [ ] Implement proper delete confirmation
   - [ ] Add real-time updates for shared moodboards

3. Data Persistence
   - [ ] Verify Supabase RLS policies
   - [ ] Improve error handling for save operations
   - [ ] Add offline support/local storage backup

## Technical Stack

- Next.js 13+ (App Router)
- TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS
- Radix UI (via shadcn/ui)
- Framer Motion

## Environment Setup

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

## Project Structure

```
vibe/
├── app/                # Next.js app router pages
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── moodboard/     # Moodboard-related components
│   └── ui/            # Shared UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and types
└── types/             # TypeScript type definitions
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT License
