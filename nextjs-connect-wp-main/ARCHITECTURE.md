# Supabase Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                        │
│  (Next.js Client Components & Static Assets)               │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   ┌─────────────┐      ┌──────────────┐
   │ Client-side │      │ Server-side  │
   │ Components  │      │ Components   │
   │ (useAuth)   │      │ (Server-only)│
   └─────────────┘      └──────────────┘
        │                     │
        │ (Anon Key)         │ (Service Role Key)
        │                     │
        └──────────────┬──────┘
                       │
        ┌──────────────▼──────────────┐
        │   Next.js API Routes        │
        │                             │
        │ • /api/analytics            │
        │ • /api/comments             │
        │ • /api/newsletter           │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │     Supabase Backend Services       │
        │                                      │
        │  ┌────────────────────────────────┐│
        │  │  PostgreSQL Database           ││
        │  │                                 ││
        │  │  Tables:                        ││
        │  │  • user_profiles                ││
        │  │  • posts_analytics              ││
        │  │  • user_comments                ││
        │  │  • newsletter_subscribers       ││
        │  │  • user_interactions            ││
        │  │                                 ││
        │  │  Features:                      ││
        │  │  ✓ Row Level Security (RLS)    ││
        │  │  ✓ Triggers & Functions        ││
        │  │  ✓ Indexes for Performance     ││
        │  └────────────────────────────────┘│
        │                                      │
        │  ┌────────────────────────────────┐│
        │  │  Realtime Subscriptions        ││
        │  │  (WebSocket)                   ││
        │  │                                 ││
        │  │  • Analytics updates            ││
        │  │  • Comments stream              ││
        │  │  • Presence tracking            ││
        │  └────────────────────────────────┘│
        │                                      │
        │  ┌────────────────────────────────┐│
        │  │  Authentication                ││
        │  │                                 ││
        │  │  • Email/Password              ││
        │  │  • OAuth (GitHub, Google)      ││
        │  │  • Session Management          ││
        │  │  • JWT Tokens                  ││
        │  └────────────────────────────────┘│
        │                                      │
        │  ┌────────────────────────────────┐│
        │  │  Storage Buckets               ││
        │  │                                 ││
        │  │  • blog-images (public)         ││
        │  │  • user-uploads (private)       ││
        │  │                                 ││
        │  │  File Operations:               ││
        │  │  ✓ Upload                      ││
        │  │  ✓ Download (public URL)       ││
        │  │  ✓ Delete                      ││
        │  │  ✓ List files                  ││
        │  └────────────────────────────────┘│
        │                                      │
        └──────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  WordPress REST API         │
        │  (External Data Source)     │
        │                             │
        │  • Posts                    │
        │  • Pages                    │
        │  • Categories               │
        │  • Tags                     │
        │  • Authors                  │
        │  • Media                    │
        └─────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
User Signup/Login
       │
       ▼
┌────────────────────────┐
│ AuthForm Component     │
│ (Client-side)          │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│ Supabase Auth Service  │
│ • Validate credentials │
│ • Hash password        │
│ • Create JWT token     │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│ Create User Session    │
│ • Store token          │
│ • Set auth cookies     │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│ Create User Profile    │
│ • Insert user_profiles │
│ • Set default values   │
└────────────────────────┘
```

### 2. Comment Creation Flow

```
User Comments
     │
     ▼
┌──────────────────────────┐
│ CommentsSection Component│
│ (Client-side)            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ POST /api/comments       │
│ (Server-side)            │
│ • Validate input         │
│ • Check auth user        │
│ • Sanitize content       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Supabase Insert          │
│ • user_comments table    │
│ • Record user_id         │
│ • Record post_id         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Trigger Execution        │
│ • Update comment count   │
│ • posts_analytics table  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Real-time Broadcast      │
│ (WebSocket)              │
│ • Send to all clients    │
│ • New comment appears    │
│ • Count updates live     │
└──────────────────────────┘
```

### 3. Post View Tracking Flow

```
User Opens Post
      │
      ▼
┌──────────────────────┐
│ Post Page Renders    │
│ (Server-side)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ViewTracker Component│
│ (Client-side)        │
│ useEffect hook       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ POST /api/analytics  │
│ { postId: 123 }      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Increment Views      │
│ • Check if exists    │
│ • If yes: +1 views   │
│ • If no: create new  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Real-time Broadcast  │
│ • Analytics updates  │
│ • All displays sync  │
└──────────────────────┘
```

### 4. File Upload Flow

```
User Uploads Image
       │
       ▼
┌─────────────────────────┐
│ ImageUpload Component   │
│ • Validate file type    │
│ • Check file size       │
│ • Show preview         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ uploadFile Function     │
│ (Client-side)           │
│ supabase-storage.ts     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Supabase Storage API    │
│ • Upload to bucket      │
│ • Generate filename     │
│ • Store file            │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Get Public URL          │
│ • Generate CDN URL      │
│ • Return to component   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Callback & Display      │
│ • onUploadComplete()    │
│ • Show uploaded image   │
│ • Save URL to profile   │
└─────────────────────────┘
```

---

## Component Communication

```
                    Next.js App
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    ┌────────┐  ┌────────────┐  ┌────────────┐
    │ Layout │  │ Post Page  │  │ Auth Pages │
    └────┬───┘  └─────┬──────┘  └─────┬──────┘
         │            │               │
         ▼            ▼               ▼
   ┌──────────────────────────────────────┐
   │       AuthProvider (Context)         │
   │  • Session state                     │
   │  • User object                       │
   │  • Auth methods                      │
   └──────────────────────────────────────┘
         │            │               │
         ▼            ▼               ▼
    ┌────────┐  ┌──────────┐  ┌────────────┐
    │Comments│  │Analytics │  │Newsletter  │
    │Section │  │Display   │  │Subscribe   │
    └───┬────┘  └────┬─────┘  └─────┬──────┘
        │           │              │
        └─────┬─────┴──────────────┘
              │
              ▼
    ┌──────────────────────┐
    │ Supabase Client Libs │
    │                      │
    │ • supabase-client    │
    │ • supabase-db        │
    │ • supabase-storage   │
    │ • supabase-realtime  │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Supabase Backend     │
    │ (Database, Auth,     │
    │  Storage, Realtime)  │
    └──────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE POSTGRES DB                    │
└─────────────────────────────────────────────────────────────┘

auth.users (Built-in Supabase table)
    │
    ├─────► user_profiles (1:1)
    │       ├── id (FK to auth.users)
    │       ├── username
    │       ├── avatar_url
    │       └── bio
    │
    ├─────► user_comments (1:N)
    │       ├── id (PK)
    │       ├── user_id (FK to auth.users)
    │       ├── wordpress_post_id
    │       ├── content
    │       └── created_at
    │
    └─────► user_interactions (1:N)
            ├── id (PK)
            ├── user_id (FK to auth.users)
            ├── wordpress_post_id
            ├── interaction_type (view, save, like)
            └── created_at

posts_analytics (Independent)
    ├── id (PK)
    ├── wordpress_post_id (unique, from WordPress)
    ├── views (incremented on each view)
    ├── comments_count (updated by trigger)
    └── last_updated

newsletter_subscribers (Independent)
    ├── id (PK)
    ├── email (unique)
    ├── verified
    └── subscribed_at

Triggers & Functions:
    • update_post_comment_count() - Updates analytics on comment insert/delete
    • increment_post_views() - RPC function to increment views
```

---

## Security Layers

```
┌────────────────────────────────────────────┐
│         Layer 1: Client Security           │
│                                            │
│ • Browser validation                       │
│ • HTTPS only                               │
│ • Secure cookies                           │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│      Layer 2: API Validation               │
│                                            │
│ • Input validation (server-side)           │
│ • Email verification                       │
│ • Content sanitization                     │
│ • Rate limiting ready                      │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│    Layer 3: Authentication                 │
│                                            │
│ • JWT token validation                     │
│ • Session checking                         │
│ • User identity verification               │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│  Layer 4: Row Level Security (RLS)         │
│                                            │
│ • Table policies                           │
│ • User-scoped access                       │
│ • Public data exceptions                   │
│ • Trigger-based rules                      │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│      Layer 5: Database Encryption          │
│                                            │
│ • PostgreSQL native encryption             │
│ • SSL connections                          │
│ • Backup encryption                        │
└────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│          Vercel (Frontend)                  │
│                                             │
│  • Next.js App                              │
│  • API Routes                               │
│  • Edge Functions (optional)                │
│  • CDN Distribution                         │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────────┐  ┌──────────────────────┐
│ WordPress    │  │  Supabase (Cloud)    │
│              │  │                      │
│ • REST API   │  │  • PostgreSQL DB     │
│ • Content    │  │  • Auth Service      │
│ • Media      │  │  • Storage Buckets   │
└──────────────┘  │  • Realtime (WS)     │
                  └──────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
                  CDN      Backups
```

---

## Scaling Considerations

```
Current Setup (Single Instance)
    ↓
Growth Phase (Add Read Replicas)
    ├── Dashboard connections
    ├── Analytics queries
    └── Background jobs
    ↓
Scale Phase (Add Caching)
    ├── Redis for sessions
    ├── CDN for assets
    └── Query caching
    ↓
Enterprise Phase (Multiple Regions)
    ├── Multi-region DB
    ├── Edge functions
    └── Advanced monitoring
```

---

## Performance Optimization

```
Frontend
  ├── React Query for caching
  ├── Image optimization
  └── Code splitting
        ↓
Client-Server
  ├── API pagination
  ├── Compression
  └── Request batching
        ↓
Database
  ├── Indexes on common queries
  ├── Connection pooling
  └── Query optimization
        ↓
Storage
  ├── CDN distribution
  ├── Image resizing
  └── Compression
```

---

## Monitoring & Observability

```
Application Monitoring
    ├── Error tracking (Sentry)
    ├── Performance metrics
    └── User analytics
         ↓
Infrastructure Monitoring
    ├── Supabase Logs
    ├── Database metrics
    └── Storage usage
         ↓
Business Metrics
    ├── User engagement
    ├── Content performance
    └── Conversion tracking
```

---

This architecture provides:
- ✅ **Scalability** - Grows with your organisation
- ✅ **Security** - Multiple layers of protection
- ✅ **Performance** - Optimized at every level
- ✅ **Reliability** - Redundancy and backups
- ✅ **Maintainability** - Clear separation of concerns
