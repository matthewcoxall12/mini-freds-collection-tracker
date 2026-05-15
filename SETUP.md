# Mini Freds Collection Tracker - Setup Guide

A production-ready Next.js web application for tracking Austin A35 van diecast model collections.

## Quick Start

### Prerequisites

- Node.js 18+ (Node.js 24 LTS recommended)
- A Supabase account (https://supabase.com)
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd mini-freds-collection-tracker
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at https://app.supabase.com
2. In your project dashboard:
   - Go to **Settings** → **Database** → **Connection String** and copy the project URL
   - Go to **Settings** → **API** and copy the **anon public key**
   - Go to **Settings** → **API** and copy the **service_role key** (keep this secret!)

3. In the SQL Editor, run the contents of `supabase/schema.sql` to create the database schema
4. Run the contents of `supabase/seed.sql` to load the initial 50 Austin A35 models

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
ADMIN_EMAIL=your-email@example.com
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 📊 **Dashboard** - Collection statistics and quick links
- 📚 **Catalogue** - Browse all 50+ Austin A35 models with advanced search and filtering
- 🏆 **My Collection** - Track owned items with condition, price, and storage location
- 🔍 **Missing Items** - Manage your personal shopping list
- 🎨 **Dark Mode** - Beautiful dark/light theme with navy, cream, and gold design
- 👤 **User Authentication** - Supabase auth with email/password
- 🔒 **Row-Level Security** - Database-level access control
- 📤 **CSV Import/Export** - Bulk import catalogue and collection data
- ⚡ **Responsive Design** - Mobile-friendly layouts

## Project Structure

```
├── supabase/
│   ├── schema.sql          # Database schema with RLS policies
│   └── seed.sql            # 50 Austin A35 van models
├── src/
│   ├── app/
│   │   ├── page.tsx        # Home dashboard
│   │   ├── catalogue/      # Browse all models
│   │   ├── collection/     # Your owned items
│   │   ├── missing/        # Wanted items
│   │   ├── (item)/[id]/    # Item detail page
│   │   ├── admin/          # Admin tools
│   │   ├── api/            # Backend API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles & dark mode
│   ├── components/
│   │   ├── items/          # Item cards, grids, tables
│   │   ├── search/         # Search bar
│   │   ├── filters/        # Filter controls
│   │   ├── layout/         # Top nav, footer
│   │   └── theme/          # Theme provider, toggle
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   ├── auth.ts         # Auth helpers
│   │   ├── responses.ts    # API response utilities
│   │   ├── validation.ts   # Input validation
│   │   ├── constants.ts    # App constants
│   │   └── cn.ts           # Class name utility
│   └── types/
│       ├── item.ts         # Item & UserItem types
│       ├── filters.ts      # Filter types
│       ├── api.ts          # API response types
│       └── database.ts     # Database types
├── .env.example            # Environment variable template
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind CSS config
└── package.json            # Dependencies
```

## Database Schema

### Tables

- **items** - Catalogue of Austin A35 van models (public read, admin write)
- **user_items** - User's personal collection entries (private to user)

### Key Features

- Row-Level Security (RLS) for data isolation
- Trigram GIN indexes for fast text search
- Automatic `updated_at` timestamp triggers
- Rarity levels: common, uncommon, rare, epic, legendary
- Scales: 1:43, 1:64, 1:76
- Storage buckets: item-images (public), user-photos (private)

## API Endpoints

### Items

- `GET /api/items` - List all items with filtering
- `GET /api/items/[id]` - Get item details

### Collection

- `GET /api/collection` - Get user's collection
- `POST /api/collection` - Add item to collection
- `PATCH /api/collection/[id]` - Update collection item
- `DELETE /api/collection/[id]` - Remove from collection

### Utilities

- `GET /api/missing` - Get user's wanted items
- `POST /api/upload` - Upload item image
- `POST /api/import/catalogue` - Import catalogue CSV
- `POST /api/import/collection` - Import collection CSV
- `GET /api/export/collection` - Export collection as CSV

## Build & Testing

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Run production server
npm start
```

## Deployment

See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) for Vercel-specific deployment instructions.

### Key Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy - Vercel will automatically run `npm run build`
5. Test the live application

## Dark Mode

The application uses Tailwind CSS v4 with CSS variables for theming:

- **Light Mode**: Cream backgrounds (#f5efe4) with navy text
- **Dark Mode**: Deep navy (#0e1320) with cream text and gold accents (#d4a44a)

Theme preference is managed by `next-themes` and persisted to localStorage.

## Authentication

Currently configured for Supabase authentication with:

- Email/password sign up
- Row-level security policies
- Admin role detection via ADMIN_EMAIL env variable

## CSV Import/Export Format

### Catalogue Import
```
name,manufacturer,reference_number,scale,livery,rarity,status
Austin A35 Van,Vanguards,VA17000,1:43,RAC,rare,confirmed
```

### Collection Import
```
item_id,condition,boxed_status,purchase_price
550e8400-e29b-41d4-a716-446655440000,mint,boxed,45.50
```

### Collection Export
Returns user's collection with item details and personal data.

## Troubleshooting

### Build Errors

If you see build errors:

1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Run `npm run build`

### Environment Variables

Ensure `.env.local` exists in the project root with all required variables. The app will not start without them.

### Database Connection

Verify your Supabase project URL and keys are correct. Check that the database schema has been applied.

### Dark Mode Not Working

Clear browser cache and localStorage. Ensure `next-themes` is properly configured in `app/layout.tsx`.

## Support

For issues and questions, please refer to:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is provided as-is for collecting Austin A35 diecast models.
