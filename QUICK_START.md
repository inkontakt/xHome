# Quick Start Guide - Fresh Content System

## What's New
Your landing page sections now support **live markdown editing** with instant refresh! 

### The Workflow (It's Simple!)

```
1. Edit markdown in Obsidian
2. Save the file
3. Refresh browser
4. See changes immediately ✅
```

## How to Use

### Step 1: Edit Your Content
Open any markdown file in Obsidian:
- `src/content/landing-sections/010-hero.md`
- `src/content/landing-sections/020-features.md`
- `src/content/landing-sections/030-works-features.md`
- etc.

Make your changes and save.

### Step 2: Refresh the Browser
Press `F5` (Windows/Linux) or `Cmd+R` (Mac) to refresh the page.

### Step 3: Enjoy Updated Content
Your changes appear instantly on the page!

---

## What Changed Behind the Scenes

### ✅ Added Files
- **`src/pages/api/landing-content.json.ts`** - New API endpoint that serves fresh landing content
- **`src/hooks/useFreshLandingContent.ts`** - React hook that fetches fresh content on page load

### ✅ Updated Components
All 9 section components now use the fresh content hook:
- Hero Section
- Features Section
- Works Features Section
- Use Cases Section
- Testimonials Section
- Pricing Section
- FAQ Section
- CTA Section
- Footer Section

### ✅ How It Works
1. Server renders page with initial content
2. Components mount on the client
3. Fresh content hook fetches latest data from API
4. Components re-render with fresh content
5. User sees updated text, descriptions, etc.

---

## FAQ

**Q: Do I need to restart the dev server?**
A: No! Just refresh the browser page.

**Q: Will this work with Obsidian syncing?**
A: Yes! Any markdown changes in Obsidian will be reflected on refresh.

**Q: Is there a performance impact?**
A: Minimal (~100-200ms added per page load for the API call).

**Q: What if the API fails?**
A: It gracefully falls back to initial content, no errors shown to users.

**Q: Can I disable this?**
A: Yes, but not recommended. If needed, just remove the `useFreshLandingContent` hook calls from components and use the props directly.

---

## Troubleshooting

### Changes not showing?
1. Make sure you saved the file in Obsidian
2. Try a hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. Check browser console for any errors

### API endpoint not found?
1. Make sure the dev server is running (`npm run dev`)
2. Check that `src/pages/api/landing-content.json.ts` exists
3. Verify no console errors in browser DevTools

### Slow page loads?
- This is normal on first load (~100-200ms)
- Subsequent loads are faster with browser caching

---

## Next Steps

You're all set! Now you can:
- ✏️ Edit markdown content in Obsidian
- 🔄 Refresh browser to see changes
- 🎉 No server restarts needed
- 📝 No cache clearing needed

Happy editing!
