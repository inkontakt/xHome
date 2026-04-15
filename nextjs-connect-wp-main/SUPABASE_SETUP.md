# Supabase Integration Setup Guide

This guide walks you through setting up Supabase for your Next.js + WordPress blog.

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project:
   - Choose a name (e.g., "nextjs-blog")
   - Choose a region (choose closest to your users)
   - Create a strong database password
   - Click "Create new project" and wait for initialization

### 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy these values to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

⚠️ **IMPORTANT**: Never commit `.env.local` - add it to `.gitignore` (already done)

### 3. Setup Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase-migrations.sql`
4. Paste it into the SQL editor
5. Click "Run"
6. Wait for the schema to be created

### 4. Create Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create two new buckets:

   **Bucket 1: blog-images**
   - Make it Public
   - Add policy for authenticated uploads

   **Bucket 2: user-uploads**
   - Make it Private
   - Add policy for authenticated uploads/access

### 5. Configure Storage Policies (Optional but Recommended)

For each bucket, set Row Level Security policies in the Storage section.

### 6. Setup Environment Variables

Create `.env.local` (never commit this file):

```bash
# WordPress
WORDPRESS_URL="https://your-wordpress.com"
WORDPRESS_HOSTNAME="your-wordpress.com"
WORDPRESS_WEBHOOK_SECRET="your-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED="true"
```

## Features Implemented

### 1. Authentication ✅
- Email/password sign up and sign in
- OAuth support (add in auth-context.tsx)
- Protected API routes
- User sessions with Supabase Auth

**Usage:**
```tsx
import { useAuth } from '@/components/auth/auth-context'

export function MyComponent() {
  const { user, signIn, signOut } = useAuth()
  
  return (
    <div>
      {user ? <p>Welcome, {user.email}</p> : <p>Not signed in</p>}
    </div>
  )
}
```

### 2. User Profiles ✅
- Create user profiles on signup
- Update profile info (bio, avatar)
- Privacy-controlled via RLS

**Usage:**
```tsx
import { getUserProfile, updateUserProfile } from '@/lib/supabase-db'

const profile = await getUserProfile(userId)
await updateUserProfile(userId, { bio: 'New bio' })
```

### 3. Post Analytics ✅
- Track post views in real-time
- Monitor comment counts
- Automatic aggregation

**Usage:**
```tsx
import { AnalyticsDisplay } from '@/components/posts/analytics-display'

<AnalyticsDisplay postId={12} />
```

### 4. Comments System ✅
- Real-time comments with Supabase subscriptions
- Comment creation, deletion, moderation ready
- User authentication required

**Usage:**
```tsx
import { CommentsSection } from '@/components/posts/comments-section'

<CommentsSection postId={12} />
```

### 5. Newsletter Signup ✅
- Email subscription management
- Duplicate prevention
- Ready for email service integration

**Usage:**
```tsx
import { NewsletterSubscribe } from '@/components/newsletter-subscribe'

<NewsletterSubscribe />
```

### 6. File Storage ✅
- Upload images to Supabase Storage
- Get public URLs
- Delete files

**Usage:**
```tsx
import { ImageUpload } from '@/components/auth/image-upload'

<ImageUpload 
  bucket="blog-images" 
  folder="posts"
  onUploadComplete={(url) => console.log('Uploaded:', url)}
/>
```

### 7. Real-time Features ✅
- Live comment updates
- Live analytics
- Presence tracking

**Usage:**
```tsx
import { usePostComments } from '@/lib/supabase-realtime'

const { comments } = usePostComments(postId)
```

## API Routes

### Analytics
- `GET /api/analytics?postId=123` - Get post analytics
- `POST /api/analytics` - Increment views

### Comments
- `GET /api/comments?postId=123` - Get comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments?commentId=uuid&userId=uuid` - Delete comment

### Newsletter
- `GET /api/newsletter?email=user@example.com` - Check subscription
- `POST /api/newsletter` - Subscribe
- `DELETE /api/newsletter` - Unsubscribe

## Integration Steps

### Step 1: Add Auth Provider to Layout
```tsx
// app/layout.tsx
import { AuthProvider } from '@/components/auth/auth-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Step 2: Add Components to Posts
```tsx
// app/posts/[slug]/page.tsx
import { CommentsSection } from '@/components/posts/comments-section'
import { AnalyticsDisplay } from '@/components/posts/analytics-display'

export default async function PostPage({ params }) {
  const post = await getPostBySlug((await params).slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <AnalyticsDisplay postId={post.id} />
      {/* Post content */}
      <CommentsSection postId={post.id} />
    </article>
  )
}
```

### Step 3: Add Newsletter to Footer
```tsx
// components/layout/footer.tsx
import { NewsletterSubscribe } from '@/components/newsletter-subscribe'

export function Footer() {
  return (
    <footer>
      <NewsletterSubscribe />
    </footer>
  )
}
```

### Step 4: Track Post Views
```tsx
// In your post page
useEffect(() => {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId: post.id })
  })
}, [post.id])
```

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use `.env.example` as template
- ✅ Rotate keys periodically
- ✅ Use different keys for staging/production

### 2. Row Level Security
- ✅ All tables have RLS enabled
- ✅ Default deny, explicit allow policies
- ✅ Users can only access their own data
- ✅ Public data is readable by everyone

### 3. API Routes
- ✅ Validate all inputs
- ✅ Check user authentication
- ✅ Use service role key server-side only
- ✅ Sanitize user content

### 4. Storage
- ✅ Private bucket for user uploads
- ✅ Public bucket for blog images
- ✅ Validate file types and sizes
- ✅ Use signed URLs for sensitive files

## Monitoring & Maintenance

### View Logs
- Supabase Dashboard → Logs
- Check for errors in Auth, Database, Storage, Edge Functions

### Monitor Analytics
- Supabase Dashboard → Database → query analytics
- Check slow queries
- Optimize indexes if needed

### Backup Data
- Supabase automatically backs up daily
- Enable point-in-time recovery if needed
- Export data regularly for safety

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
pnpm install
```

### "NEXT_PUBLIC_SUPABASE_URL not defined"
- Check `.env.local` exists and is properly formatted
- Restart dev server: `pnpm dev`

### "RLS policy denies access"
- Check RLS policies in Supabase Dashboard
- Ensure user is authenticated for protected operations
- Verify user ID matches policy conditions

### "Storage upload fails"
- Check bucket exists and is public/has correct policies
- Verify file size < 5MB
- Ensure authenticated user

## Next Steps

1. ✅ Install packages
2. ✅ Create Supabase project
3. ✅ Run database migrations
4. ✅ Setup storage buckets
5. ✅ Add environment variables
6. ✅ Integrate components into pages
7. ✅ Test authentication flow
8. ✅ Test comments and analytics
9. ⏭️ Setup email service for newsletter
10. ⏭️ Setup automated backups
11. ⏭️ Deploy to production

## Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/frameworks/nextjs)

## Support

For issues or questions:
1. Check [Supabase Docs](https://supabase.com/docs)
2. Check [Supabase Community](https://discord.supabase.io)
3. Review error messages in Supabase Logs
