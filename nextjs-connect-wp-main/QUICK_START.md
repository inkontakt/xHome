# 🚀 Supabase Quick Start (5 minutes)

Fast-track guide to get Supabase working immediately.

## 1️⃣ Create Supabase Project (2 min)

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Fill in:
   - Name: `nextjs-blog` (or your preference)
   - Region: Closest to you
   - Password: Strong password
4. Click "Create new project" and wait ~1 minute

## 2️⃣ Get Your Credentials (1 min)

1. Click Settings (⚙️) in sidebar
2. Click "API" in left menu
3. Copy these three values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

## 3️⃣ Add Environment Variables (30 sec)

Create `.env.local` in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: Add `.env.local` to `.gitignore` (already done)

## 4️⃣ Setup Database (1 min)

1. In Supabase, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Open `supabase-migrations.sql` in this project
4. Copy everything and paste into the query box
5. Click "Run" ▶️
6. Wait for success message

## 5️⃣ Create Storage Buckets (30 sec)

1. In Supabase, click "Storage" (left sidebar)
2. Click "Create new bucket"
3. Name: `blog-images`
4. Make it Public ☑️
5. Click "Create bucket"

Repeat for: `user-uploads` (make it Private)

## 6️⃣ Wrap Your Layout (1 min)

Edit `app/layout.tsx`:

```typescript
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

## 7️⃣ Add to Post Page (30 sec)

Edit `app/posts/[slug]/page.tsx` - add after the article:

```typescript
import { CommentsSection } from '@/components/posts/comments-section'
import { AnalyticsDisplay } from '@/components/posts/analytics-display'
import { ViewTracker } from '@/components/posts/view-tracker'

// ... inside the component, add:

<AnalyticsDisplay postId={post.id} />
<CommentsSection postId={post.id} />
<ViewTracker postId={post.id} />
```

## 8️⃣ Add Newsletter to Footer (30 sec)

Edit `components/layout/footer.tsx`:

```typescript
import { NewsletterSubscribe } from '@/components/newsletter-subscribe'

export function Footer() {
  return (
    <footer>
      <NewsletterSubscribe />
    </footer>
  )
}
```

## ✅ That's It!

```bash
pnpm dev
```

Now test:
- [ ] Go to your blog post
- [ ] See analytics display (0 views)
- [ ] Comments section appears
- [ ] Try signing up (bottom right usually)
- [ ] Leave a comment
- [ ] See comment appear instantly ✨
- [ ] Check footer newsletter signup

---

## 🎉 What You Can Do Now

- **Users can sign up** with email/password
- **Post views tracked** automatically
- **Comments in real-time** - appear instantly
- **Newsletter signups** collected
- **File uploads** to storage
- **User profiles** created on signup

---

## 📖 Learn More

- Full setup guide: `SUPABASE_SETUP.md`
- Component reference: `SUPABASE_COMPONENTS.md`
- Complete details: `SUPABASE_COMPLETE.md`

---

## ⚡ Troubleshooting

**"Can't see comments component"**
- Restart dev server: `pnpm dev`
- Check browser console for errors
- Verify AuthProvider in layout.tsx

**"Env variables not working"**
- Restart dev server after creating `.env.local`
- Check values are copied correctly
- No extra spaces or quotes

**"Comments not saving"**
- Sign in first (comments need auth)
- Check Supabase dashboard for database errors
- Verify migrations ran successfully

**"File upload fails"**
- Check buckets exist in Storage
- Verify bucket names match your code
- Check file is actually an image

---

That's it! Your Supabase integration is complete. 🚀
