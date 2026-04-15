# Supabase Components & Utilities Reference

Complete documentation of all Supabase components, hooks, and utilities added to your Next.js blog.

## 📁 File Structure

```
lib/
├── supabase-client.ts      # Browser-safe Supabase client
├── supabase-server.ts      # Server-only Supabase client (service role)
├── supabase-db.ts          # Database operations (CRUD)
├── supabase-storage.ts     # File storage operations
└── supabase-realtime.ts    # Real-time subscriptions hooks

components/
├── auth/
│   ├── auth-context.tsx    # Auth provider & useAuth hook
│   ├── auth-form.tsx       # Sign in/up form component
│   └── image-upload.tsx    # Image upload to storage
├── posts/
│   ├── comments-section.tsx    # Comments display & creation
│   ├── analytics-display.tsx   # View/comment analytics
│   └── view-tracker.tsx        # Track post views
└── newsletter-subscribe.tsx    # Newsletter signup form

app/api/
├── analytics/route.ts      # GET/POST analytics
├── comments/route.ts       # GET/POST/DELETE comments
└── newsletter/route.ts     # POST/GET/DELETE newsletter

supabase-migrations.sql    # Database schema setup
SUPABASE_SETUP.md         # Setup guide
SUPABASE_COMPONENTS.md    # This file
```

---

## 🔧 Library Utilities

### `lib/supabase-client.ts`

Browser-safe Supabase client using anon key (read-only by default via RLS).

```typescript
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()
// Use in client components for read operations
// RLS policies control what data users can access
```

### `lib/supabase-server.ts`

Server-only utilities for API routes and server components.

```typescript
import { createServerSupabaseClient, getSupabaseServiceClient } from '@/lib/supabase-server'

// For server components (with cookies)
const supabase = await createServerSupabaseClient()

// For API routes (with full access)
const serviceClient = await getSupabaseServiceClient()
```

⚠️ **IMPORTANT**: Service role key is server-only. Never expose to client.

---

### `lib/supabase-db.ts`

Database operations with TypeScript types.

#### Types

```typescript
export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface PostAnalytics {
  id: string
  wordpress_post_id: number
  views: number
  comments_count: number
  last_updated: string
  created_at: string
}

export interface UserComment {
  id: string
  user_id: string
  wordpress_post_id: number
  content: string
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
  verified: boolean
}

export interface UserInteraction {
  id: string
  user_id: string
  wordpress_post_id: number
  interaction_type: 'view' | 'save' | 'like'
  created_at: string
}
```

#### Functions

**User Profiles**
```typescript
// Get user profile
const profile = await getUserProfile(userId)

// Update user profile
const updated = await updateUserProfile(userId, {
  bio: 'My new bio',
  avatar_url: 'https://example.com/avatar.jpg'
})
```

**Analytics**
```typescript
// Get post analytics
const analytics = await getPostAnalytics(wordpressPostId)

// Increment post views (server-only)
await incrementPostViews(wordpressPostId)
```

**Comments**
```typescript
// Get post comments
const comments = await getPostComments(wordpressPostId)

// Create comment (requires authenticated user)
const comment = await createComment(userId, wordpressPostId, 'Great post!')
```

**Newsletter**
```typescript
// Subscribe email
const success = await subscribeToNewsletter('user@example.com')

// Check subscription status
const isSubscribed = await isEmailSubscribed('user@example.com')
```

**User Interactions**
```typescript
// Record interaction (view, save, like)
await recordInteraction(userId, wordpressPostId, 'view')

// Get user interactions
const interactions = await getUserInteractions(userId, 'save') // optional type filter
```

---

### `lib/supabase-storage.ts`

File storage operations for uploading and retrieving files.

```typescript
// Upload file
const result = await uploadFile(file, 'blog-images', 'posts')
// result = { path: 'posts/123456-image.jpg', url: 'https://...' }

// Get public URL
const url = getPublicUrl('blog-images', 'posts/image.jpg')

// Delete file
await deleteFile('blog-images', 'posts/image.jpg')

// List files in folder
const files = await listFiles('blog-images', 'posts')
```

---

### `lib/supabase-realtime.ts`

Real-time subscription hooks for live updates.

#### `usePostAnalytics(postId)`

Subscribe to post analytics updates in real-time.

```typescript
import { usePostAnalytics } from '@/lib/supabase-realtime'

function Analytics({ postId }) {
  const { analytics, isLoading } = usePostAnalytics(postId)
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      Views: {analytics?.views}
      Comments: {analytics?.comments_count}
    </div>
  )
}
```

#### `usePostComments(postId)`

Subscribe to post comments in real-time.

```typescript
import { usePostComments } from '@/lib/supabase-realtime'

function Comments({ postId }) {
  const { comments, isLoading } = usePostComments(postId)
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.content}</div>
      ))}
    </div>
  )
}
```

#### `usePresence(channel)`

Track online users in real-time.

```typescript
import { usePresence } from '@/lib/supabase-realtime'

function OnlineUsers({ postId }) {
  const { onlineUsers } = usePresence(`post-${postId}`)
  
  return <div>{onlineUsers.length} users online</div>
}
```

---

## 🎨 Components

### `components/auth/auth-context.tsx`

Authentication context provider with useAuth hook.

**Setup (add to your layout):**
```typescript
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

**Usage:**
```typescript
import { useAuth } from '@/components/auth/auth-context'

function MyComponent() {
  const { user, session, loading, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <>
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => signIn('user@example.com', 'password')}>
          Sign In
        </button>
      )}
    </>
  )
}
```

---

### `components/auth/auth-form.tsx`

Pre-built authentication form component.

```typescript
import { AuthForm } from '@/components/auth/auth-form'

export default function SignInPage() {
  return (
    <div>
      <h1>Sign In or Create Account</h1>
      <AuthForm />
    </div>
  )
}
```

Features:
- Email/password sign up and sign in
- Toggle between modes
- Error display
- Loading state

---

### `components/auth/image-upload.tsx`

File upload component with preview.

```typescript
import { ImageUpload } from '@/components/auth/image-upload'

export default function UploadPage() {
  return (
    <ImageUpload
      bucket="blog-images"
      folder="posts"
      maxSizeMB={10}
      onUploadComplete={(url, path) => {
        console.log('Uploaded to:', url)
      }}
    />
  )
}
```

Props:
- `bucket: string` - Storage bucket name
- `folder?: string` - Folder path in bucket (default: root)
- `onUploadComplete?: (url, path) => void` - Callback after upload
- `maxSizeMB?: number` - Max file size (default: 5)

Features:
- Drag and drop
- File type validation (images only)
- File size validation
- Preview after upload

---

### `components/posts/comments-section.tsx`

Complete comments display and creation component with real-time updates.

```typescript
import { CommentsSection } from '@/components/posts/comments-section'

export default function PostPage({ post }) {
  return (
    <>
      <article>
        <h1>{post.title}</h1>
        {/* Post content */}
      </article>
      
      <CommentsSection postId={post.id} />
    </>
  )
}
```

Features:
- Real-time comment updates
- Authentication required to comment
- Comment form with validation
- Auto-formatted timestamps

---

### `components/posts/analytics-display.tsx`

Display post analytics (views and comments count).

```typescript
import { AnalyticsDisplay } from '@/components/posts/analytics-display'

export default function PostPage({ post }) {
  return (
    <>
      <h1>{post.title}</h1>
      <AnalyticsDisplay postId={post.id} />
    </>
  )
}
```

Features:
- Real-time view count
- Real-time comment count
- Icons from lucide-react
- Minimal design

---

### `components/posts/view-tracker.tsx`

Client-side component to track post views.

```typescript
import { ViewTracker } from '@/components/posts/view-tracker'

export default function PostPage({ post }) {
  return (
    <>
      <article>{/* Post content */}</article>
      <ViewTracker postId={post.id} />
    </>
  )
}
```

Features:
- Automatically increments view count on mount
- Handles errors silently
- No UI (invisible component)

---

### `components/newsletter-subscribe.tsx`

Newsletter subscription form.

```typescript
import { NewsletterSubscribe } from '@/components/newsletter-subscribe'

// Add to footer or sidebar
export function Footer() {
  return (
    <footer>
      <h3>Subscribe to our newsletter</h3>
      <NewsletterSubscribe />
    </footer>
  )
}
```

Features:
- Email validation
- Duplicate prevention
- Success/error messages
- Loading state

---

## 🔌 API Routes

### `GET /api/analytics?postId=123`

Get post analytics.

```typescript
const response = await fetch('/api/analytics?postId=123')
const data = await response.json()
// { wordpress_post_id: 123, views: 42, comments_count: 5, ... }
```

### `POST /api/analytics`

Increment post views.

```typescript
await fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: 123 })
})
```

---

### `GET /api/comments?postId=123`

Get post comments.

```typescript
const response = await fetch('/api/comments?postId=123')
const comments = await response.json()
```

### `POST /api/comments`

Create a comment (requires authentication).

```typescript
const response = await fetch('/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postId: 123,
    userId: user.id,
    content: 'Great post!'
  })
})
const comment = await response.json()
```

### `DELETE /api/comments?commentId=uuid&userId=uuid`

Delete a comment (user must be author).

```typescript
await fetch('/api/comments?commentId=...&userId=...', {
  method: 'DELETE'
})
```

---

### `POST /api/newsletter`

Subscribe to newsletter.

```typescript
const response = await fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})
```

### `GET /api/newsletter?email=user@example.com`

Check subscription status.

```typescript
const response = await fetch('/api/newsletter?email=user@example.com')
const data = await response.json()
// { subscribed: true, verified: false }
```

### `DELETE /api/newsletter`

Unsubscribe from newsletter.

```typescript
await fetch('/api/newsletter', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})
```

---

## 🔒 Security Patterns

### Protected Queries (Client)

Use RLS policies. These automatically apply based on authenticated user:

```typescript
// This query only returns user's own profile (enforced by RLS)
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', auth.uid())
```

### Protected Mutations (Server)

Use service role key for operations that bypass RLS:

```typescript
// In API route with service role key
const supabase = await getSupabaseServiceClient()

// This can write to any user's profile (use carefully!)
await supabase
  .from('user_profiles')
  .insert({ id: userId, bio: 'Admin update' })
```

### Input Validation

Always validate on server:

```typescript
// In API route
if (content.trim().length === 0 || content.length > 5000) {
  return NextResponse.json(
    { error: 'Invalid content' },
    { status: 400 }
  )
}
```

### Rate Limiting (Recommended)

Add middleware for rate limiting in production. See `/next.config.ts` for edge config.

---

## 📊 Database Schema

See `supabase-migrations.sql` for complete schema with RLS policies and functions.

Key tables:
- `user_profiles` - User information
- `posts_analytics` - Post view and comment counts
- `user_comments` - Comments on posts
- `newsletter_subscribers` - Newsletter emails
- `user_interactions` - User activity tracking

---

## 🚀 Quick Integration Checklist

- [ ] Install Supabase packages (`pnpm install` already done)
- [ ] Create Supabase project at supabase.com
- [ ] Add environment variables to `.env.local`
- [ ] Run database migrations in Supabase SQL editor
- [ ] Create storage buckets
- [ ] Wrap layout with `<AuthProvider>`
- [ ] Add components to pages:
  - [ ] `<CommentsSection>` to post page
  - [ ] `<AnalyticsDisplay>` to post page
  - [ ] `<ViewTracker>` to post page
  - [ ] `<NewsletterSubscribe>` to footer
- [ ] Test authentication flow
- [ ] Test comments creation
- [ ] Test file uploads
- [ ] Test newsletter signup

---

## 🆘 Troubleshooting

### Components not rendering

- Ensure `<AuthProvider>` wraps your app in layout
- Check browser console for errors
- Verify environment variables are set

### "useAuth must be used within an AuthProvider"

- Move `useAuth()` to a component inside `<AuthProvider>`
- Ensure layout has `<AuthProvider>` as top-level wrapper

### "RLS policy denies access"

- User not authenticated (check `useAuth()` return)
- RLS policy doesn't allow operation (check Supabase policies)
- Service role key needed (use server API route instead)

### File uploads failing

- Check bucket exists and correct policy is set
- Verify file size < 5MB (or custom maxSizeMB)
- Ensure authenticated user for private bucket

### Real-time updates not working

- Check browser console for WebSocket errors
- Verify real-time is enabled on table (Supabase dashboard)
- Check firewall/proxy doesn't block WebSockets

---

## 📚 Learn More

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Supabase Guide](https://supabase.com/docs/guides/getting-started/frameworks/nextjs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
