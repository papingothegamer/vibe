# vibe - Moodboard Creation App

A modern React/Next.js application for creating and sharing digital moodboards with real-time collaboration features.

## Features Implemented (in progress)

- ✅ User authentication with Supabase
- ✅ Moodboard creation and editing
- ✅ Real-time saving functionality
- ✅ Image upload and management
- ✅ Text element creation and styling
- ✅ Google Fonts integration for text elements
- ✅ Font search and preview functionality
- ✅ Drag and drop interface with precise positioning
- ✅ Background color customization
- ✅ Share functionality with unique URLs
- ✅ Export to PNG with high quality
- ✅ Responsive design
- ✅ Dark/Light mode support
- ✅ Undo/Redo functionality
- ✅ Element rotation
- ✅ Element layering (z-index control)
- ✅ Advanced font selection with preview and confirmation
- ✅ Font sorting by popularity and alphabetical order
- ✅ Export to PNG and PDF formats
- ✅ Expanded canvas view for detailed editing
- ✅ Improved drag and drop functionality
- ✅ Enhanced toolbar controls
- ✅ Minimalist footer with social links

## Current Issues to Fix

1. Authentication Flow

   - [x] Fix redirection after sign-in
   - [ ] Improve error handling for auth state changes
   - [ ] Add social authentication providers
   - [ ] Implement password reset flow

2. Moodboard Management

   - [x] Fix text styling controls
   - [x] Add Google Fonts integration   
   - [x] Fix moodboard title update functionality
   - [x] Improve font selection UX with preview and confirmation
   - [x] Add font sorting functionality
   - [x] Add PDF export functionality
   - [x] Improve canvas expand/minimize functionality
   - [x] Add export format selection dropdown
   - [ ] Fix text/image element positioning
   - [ ] Fix font selection and update states
   - [ ] Implement proper delete confirmation
   - [ ] Add real-time updates for shared moodboards
   - [ ] Add shareable link generation for moodboards
   - [ ] Add moodboard templates
   - [ ] Implement moodboard duplication
   - [ ] Add collaborative editing features

3. Data Persistence

   - [ ] Verify Supabase RLS policies
   - [ ] Improve error handling for save operations
   - [ ] Add offline support/local storage backup
   - [ ] Implement auto-save functionality
   - [ ] Add version history

4. UI/UX Improvements
   - [x] Add font search and preview
   - [x] Improve text controls accessibility
   - [x] Add font selection confirmation flow
   - [x] Enhance font picker interface
   - [x] Add expanded canvas view for detailed editing
   - [x] Implement export format selection
   - [x] Add minimalist footer
   - [ ] Fix canvas drag issues
   - [ ] Add loading states for all actions
   - [ ] Implement better error messages
   - [ ] Add keyboard shortcuts
   - [ ] Improve mobile responsiveness
   - [ ] Add image filters and effects
   - [ ] Implement grid alignment
   - [ ] Add snap-to-grid functionality

## Recent Updates

### Font Management Improvements

- Added confirmation flow for font selection
- Implemented font preview in selection dialog
- Added font sorting (popularity/alphabetical)
- Enhanced font preview display in text controls
- Improved font picker UI/UX with better feedback
- Added temporary font selection before confirmation

### Canvas and Export Improvements

- Added PDF export functionality
- Implemented expanded canvas view for detailed editing
- Added export format selection dropdown (PNG/PDF)
- Improved canvas drag and drop behavior
- Enhanced toolbar controls and organization

### UI Enhancements

- Added minimalist footer with social links
- Improved canvas expand/minimize functionality
- Enhanced toolbar layout and controls
- Added format selection for exports

## Technical Stack

- Next.js 13+ (App Router)
- TypeScript
- Supabase
  - Authentication
  - Database
  - Storage
  - Real-time subscriptions
- Tailwind CSS
- Radix UI (via shadcn/ui)
- Framer Motion
- react-rnd (Resizable & Draggable)
- html-to-image
- Google Fonts API

## Environment Setup

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_FONTS_API_KEY=your_google_fonts_api_key
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

3. Run type checking:

```bash
pnpm type-check
```

## Project Structure

```
vibe/
├── app/                # Next.js app router pages
│   ├── (auth)/        # Authentication routes
│   ├── dashboard/     # Dashboard and moodboard management
│   └── share/         # Public sharing routes
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── moodboard/     # Moodboard-related components
│   └── ui/            # Shared UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and types
│   ├── supabase/     # Supabase client and helpers
│   └── utils/        # General utilities
└── types/             # TypeScript type definitions
```

## Database Schema

```sql
-- Moodboards table
create table moodboards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  background_color text not null,
  items jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies applied for security
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT License - See LICENSE file for details
