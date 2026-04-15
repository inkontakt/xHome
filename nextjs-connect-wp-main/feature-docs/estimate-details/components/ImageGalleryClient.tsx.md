# ImageGalleryClient Component

## Overview

The `ImageGalleryClient` component is a React client component that displays a responsive grid of image thumbnails with click-to-zoom functionality. It serves as the main image gallery interface and integrates with the `ImageLightbox` component for full-screen viewing.

## Location
`components/estimate-details/ImageGalleryClient.tsx` (86 lines)

## Props

```typescript
type ImageGalleryClientProps = {
  imageFiles: SubmissionFile[];
  showDynamic: boolean;
};
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `imageFiles` | `SubmissionFile[]` | Yes | Array of image file objects from Supabase |
| `showDynamic` | `boolean` | Yes | Whether to show dynamic content or static placeholders |

## State Management

```typescript
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
```

### State Variables
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `lightboxOpen` | `boolean` | Controls lightbox visibility | `false` |
| `lightboxStartIndex` | `number` | Starting image index for lightbox | `0` |

## Event Handlers

### `handleImageClick(index: number)`
```typescript
const handleImageClick = (index: number) => {
  setLightboxStartIndex(index);
  setLightboxOpen(true);
};
```
**Purpose**: Opens the lightbox with the clicked image as the starting point
**Parameters**: `index` - The array index of the clicked image
**Side Effects**: Updates both `lightboxStartIndex` and `lightboxOpen` state

## Component Structure

### Main Container (lines 29-76)
```tsx
<section className="rounded-lg border bg-background p-4 shadow-sm">
  {/* Header and Grid Content */}
</section>
```

### Header Section (lines 30-33)
```tsx
<div className="flex items-center justify-between">
  <h2 className="text-lg font-semibold">Image Gallery</h2>
  <span className="text-xs text-muted-foreground">Supabase</span>
</div>
```
**Purpose**: Section title and data source indicator

### Image Grid (lines 34-69)
```tsx
<div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {/* Dynamic or Static Content */}
</div>
```

#### Responsive Grid Classes
- **Mobile**: `grid-cols-2` (2 columns)
- **Tablet**: `md:grid-cols-3` (3 columns)
- **Desktop**: `lg:grid-cols-4` (4 columns)

## Image Rendering Logic

### Dynamic Content (lines 35-63)
```tsx
{showDynamic && imageFiles.length > 0 ? (
  imageFiles.map((image, index) => (
    // Individual image buttons
  ))
) : (
  // Empty state
)}
```

#### Individual Image Button (lines 37-62)
```tsx
<button
  key={image.file_url ?? image.file_name ?? index}
  onClick={() => handleImageClick(index)}
  className="relative aspect-square overflow-hidden bg-muted hover:bg-primary border-0 p-0 cursor-pointer group rounded-md transition-colors"
  aria-label={`View photo ${index + 1} in detail`}
>
```

**Key Features**:
- **Aspect Ratio**: `aspect-square` maintains 1:1 ratio
- **Hover Effects**: `hover:bg-primary` changes background on hover
- **Accessibility**: Proper `aria-label` for screen readers

#### Image Element (lines 43-50)
```tsx
<img
  src={image.file_url}
  alt={image.file_name ?? "Estimate image"}
  className="w-full h-full object-cover transition-transform group-hover:scale-105"
  loading="lazy"
/>
```

**Styling Features**:
- **Object Fit**: `object-cover` ensures images fill the container
- **Hover Animation**: `group-hover:scale-105` for zoom effect
- **Performance**: `loading="lazy"` for better performance

#### Photo Number Badge (lines 56-61)
```tsx
<div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-sm px-3 py-2">
  <span className="text-sm font-semibold text-foreground">
    Photo #{index + 1}
  </span>
</div>
```

**Design**: Semi-transparent white background with blur effect for readability

### Empty State (lines 64-68)
```tsx
<div className="col-span-full flex h-48 items-center justify-center rounded-md border border-dashed bg-muted/40 text-sm text-muted-foreground">
  Image thumbnails will appear here once linked to Supabase.
</div>
```

**Purpose**: Placeholder when no images are available
**Styling**: Dashed border with muted background

## Lightbox Integration (lines 78-83)

```tsx
<ImageLightbox
  images={imageFiles}
  initialIndex={lightboxStartIndex}
  isOpen={lightboxOpen}
  onClose={() => setLightboxOpen(false)}
/>
```

**Props Passed**:
- `images`: Full image array for navigation
- `initialIndex`: Starting position based on clicked image
- `isOpen`: Modal visibility state
- `onClose`: State reset function

**Behavior**:
- Opens a full-viewport overlay that hides background content and locks page scroll while active

## Dependencies

### Internal Dependencies
| Import | Purpose | Location |
|--------|---------|----------|
| `ImageLightbox` | Full-screen image viewer | `./ImageLightbox` |
| `SubmissionFile` | Type definition | Inherited from parent |

### External Dependencies
| Library | Purpose | Version |
|---------|---------|---------|
| `React` | Component framework | 19 |
| `Tailwind CSS` | Styling | Latest |

## Styling System

### CSS Classes Used
- **Layout**: `grid`, `grid-cols-*`, `gap-4`, `aspect-square`
- **Visual**: `rounded-lg`, `border`, `bg-background`, `shadow-sm`
- **Interactive**: `hover:bg-primary`, `transition-colors`, `cursor-pointer`
- **Typography**: `text-lg`, `font-semibold`, `text-muted-foreground`
- **Effects**: `group-hover:scale-105`, `backdrop-blur-sm`

### Design System Integration
- **Colors**: Uses theme colors (`bg-primary`, `text-foreground`)
- **Spacing**: Consistent padding and margins
- **Typography**: Semantic heading hierarchy
- **Accessibility**: Focus states and screen reader support

## Performance Considerations

### Image Loading
- **Lazy Loading**: `loading="lazy"` for below-fold images
- **Progressive Enhancement**: Images load as user scrolls
- **Error Handling**: Fallback UI when `file_url` is missing

### Rendering Optimization
- **Key Prop**: Uses `file_url` or `file_name` or `index` for stable keys
- **Conditional Rendering**: Only renders dynamic content when needed
- **Minimal Re-renders**: State changes only affect lightbox visibility

## Accessibility Features

### ARIA Labels
- Button labels: `"View photo {index + 1} in detail"`
- Semantic HTML: Proper heading hierarchy
- Keyboard Navigation: Inherited from lightbox component

### Focus Management
- Natural tab order through button elements
- Visual focus indicators via CSS
- Screen reader announcements for image counts

## Error Handling

### Missing Images
```tsx
{image.file_url ? (
  <img src={image.file_url} ... />
) : (
  <div className="...">Image URL missing</div>
)}
```

### Empty Gallery
- Shows placeholder when `imageFiles.length === 0`
- Different messages for dynamic vs static mode

## Testing Considerations

### State Testing
- Lightbox open/close functionality
- Correct initial index setting
- State reset on close

### Interaction Testing
- Click handlers on image buttons
- Hover effects and animations
- Responsive grid behavior

### Edge Cases
- Empty image arrays
- Missing file URLs
- Network loading states

## Related Components

- **[ImageLightbox](../ImageLightbox.tsx.md)** - Full-screen image viewer (child component)
- **[Main Page](../../page.tsx.md)** - Parent component providing data and layout
- **[PdfViewerClient](../PdfViewerClient.tsx.md)** - Sibling component for PDF display

## Future Enhancements

### Potential Features
- **Drag & Drop**: Reorder images functionality
- **Bulk Selection**: Multi-select for batch operations
- **Image Upload**: Direct upload interface
- **Filtering**: By date, type, or tags

### Performance Improvements
- **Virtual Scrolling**: For large image collections
- **Progressive Loading**: Multiple quality levels
- **Caching**: Browser cache optimization

### UX Improvements
- **Loading Skeletons**: Better perceived performance
- **Image Zoom**: Inline zoom before lightbox
- **Keyboard Shortcuts**: Quick navigation hints
