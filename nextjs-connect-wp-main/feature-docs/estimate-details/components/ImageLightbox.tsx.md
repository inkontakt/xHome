# ImageLightbox Component

## Overview

The `ImageLightbox` component is a full-screen modal component that provides an immersive image viewing experience with navigation controls, keyboard support, and thumbnail previews. It renders in a portal to `document.body`, locks background scrolling, and fully hides underlying content while open.

## Location
`components/estimate-details/ImageLightbox.tsx` (181 lines)

## Props

```typescript
type ImageLightboxProps = {
  images: ImageFile[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `images` | `ImageFile[]` | Yes | - | Array of image objects for the gallery |
| `initialIndex` | `number` | No | `0` | Starting image index when opened |
| `isOpen` | `boolean` | Yes | - | Controls modal visibility |
| `onClose` | `function` | Yes | - | Callback function to close the lightbox |

## State Management

```typescript
const [selectedIndex, setSelectedIndex] = useState(initialIndex);
```

### State Variables
| Variable | Type | Purpose | Initial Value |
|----------|------|---------|---------------|
| `selectedIndex` | `number` | Currently displayed image index | `initialIndex` prop |

## Effects & Event Handlers

### Index Reset Effect (lines 28-33)
```typescript
useEffect(() => {
  if (isOpen) {
    setSelectedIndex(initialIndex);
  }
}, [isOpen, initialIndex]);
```
**Purpose**: Resets the selected image when the lightbox opens with a new initial index
**Dependencies**: `isOpen`, `initialIndex`

### Keyboard Navigation Effect (lines 35-51)
```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft") {
      handlePrevPhoto();
    } else if (e.key === "ArrowRight") {
      handleNextPhoto();
    }
  };

document.addEventListener("keydown", handleKeyDown);
return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, selectedIndex]);
```

**Keyboard Shortcuts**:
- **Escape**: Close lightbox
- **Arrow Left**: Previous image
- **Arrow Right**: Next image

### Body Scroll Lock Effect (lines 53-63)
```typescript
useEffect(() => {
  if (!isOpen) return;

  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalOverflow;
  };
}, [isOpen]);
```
**Purpose**: Prevents the page (PDF and header) from scrolling while the lightbox is open

### Navigation Functions

#### `handleNextPhoto()`
```typescript
const handleNextPhoto = () => {
  setSelectedIndex((prev) => (prev + 1) % images.length);
};
```
**Behavior**: Cycles to next image, wraps to first image when reaching the end

#### `handlePrevPhoto()`
```typescript
const handlePrevPhoto = () => {
  setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
};
```
**Behavior**: Cycles to previous image, wraps to last image when reaching the beginning

## Component Structure

### Modal Overlay (lines 66-179)
```tsx
createPortal(
  <div
    className="fixed inset-0 z-[100] bg-background overflow-hidden"
    role="dialog"
    aria-modal="true"
  >
    {/* Modal Content */}
  </div>,
  document.body
)
```

**Styling Features**:
- **Full Screen**: `fixed inset-0` covers entire viewport
- **Higher Z-Index**: `z-[100]` ensures it appears above sticky navigation
- **Opaque Backdrop**: Solid background hides PDF and header beneath the overlay
- **Portal Rendering**: Mounted under `document.body` to avoid layout stacking issues

### Layout Container (line 67)
```tsx
<div className="h-full flex flex-col">
  {/* Header, Content, Controls */}
</div>
```

### Header Section (lines 68-87)
```tsx
<div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
  <div className="flex items-center gap-4">
    <h2 className="text-lg font-semibold">
      Photo {selectedIndex + 1} of {images.length}
    </h2>
    {selectedImage.file_name && (
      <span className="text-sm text-muted-foreground">
        {selectedImage.file_name}
      </span>
    )}
  </div>
  <button onClick={onClose} className="rounded-md border border-destructive bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90">
    Close
  </button>
</div>
```

**Features**:
- **Photo Counter**: Shows current position (e.g., "Photo 3 of 7")
- **File Name**: Displays image filename when available
- **Close Button**: Primary-colored hover effect

## Image Display Area (lines 90-103)

### Container (lines 91-103)
```tsx
<div className="flex-1 flex items-center justify-center bg-[#f1f5f9] rounded-lg overflow-hidden mx-6 my-4 max-h-[calc(100vh-200px)] min-h-[400px]">
  {/* Image or Placeholder */}
</div>
```

**Responsive Constraints**:
- **Maximum Height**: `calc(100vh-200px)` prevents overflow
- **Minimum Height**: `400px` ensures reasonable display size
- **Background**: Custom color `#f1f5f9` (light slate)

### Image Element (lines 93-99)
```tsx
<img
  src={selectedImage.file_url}
  alt={selectedImage.file_name ?? `Photo ${selectedIndex + 1}`}
  className="max-w-full h-full object-contain"
/>
```

**Scaling Behavior**:
- **`object-contain`**: Maintains aspect ratio, fits entire image
- **`max-w-full h-full`**: Allows upscaling to fill container height
- **Responsive**: Scales appropriately for different image sizes

## Navigation Controls (lines 105-158)

### Previous/Next Buttons (lines 107-125)
```tsx
<div className="flex items-center justify-between gap-3 mb-4">
  <button onClick={handlePrevPhoto} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-primary hover:text-white transition-colors">
    <ChevronLeft size={16} />
    Previous
  </button>
  <button onClick={handleNextPhoto} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-secondary bg-secondary text-white rounded-lg transition-colors hover:bg-primary hover:text-white">
    Next
    <ChevronRight size={16} />
  </button>
</div>
```

**Styling Features**:
- **Equal Width**: `flex-1` makes both buttons equal size
- **Hover Effects**: Primary background with white text
- **Icons**: Lucide React icons for visual clarity

### Thumbnail Strip (lines 127-157)
```tsx
<div className="flex gap-2 overflow-x-auto pb-2">
  {images.map((image, idx) => (
    <button
      key={image.file_url ?? idx}
      onClick={() => setSelectedIndex(idx)}
      className={`relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
        idx === selectedIndex
          ? "border-primary"
          : "border-border hover:border-muted-foreground"
      }`}
    >
      {/* Thumbnail Image */}
      <div className="absolute bottom-0 right-0 bg-foreground text-background text-xs font-bold w-5 h-5 flex items-center justify-center">
        {idx + 1}
      </div>
    </button>
  ))}
</div>
```

**Features**:
- **Horizontal Scrolling**: `overflow-x-auto` for many thumbnails
- **Active State**: Primary border for current image
- **Number Badges**: Position indicators on each thumbnail
- **Hover Effects**: Subtle border color change

## Dependencies

### Internal Dependencies
| Import | Purpose | Location |
|--------|---------|----------|
| `ChevronLeft, ChevronRight, X` | Navigation icons | `lucide-react` |

### External Dependencies
| Library | Purpose | Version |
|---------|---------|---------|
| `React` | useState, useEffect hooks | 19 |
| `lucide-react` | Icon components | Latest |
| `TypeScript` | Type definitions | Latest |

## Styling System

### Key Design Elements
- **Modal Overlay**: Semi-transparent background with backdrop blur
- **Color Scheme**: Primary theme colors for interactive elements
- **Typography**: Consistent text sizing and hierarchy
- **Spacing**: Systematic padding and margins throughout

### Responsive Design
- **Height Constraints**: Prevents overflow on different screen sizes
- **Flexible Layout**: Adapts to various image aspect ratios
- **Touch-Friendly**: Adequate button sizes for mobile interaction

## Performance Considerations

### Rendering Optimization
- **Conditional Rendering**: Only renders when `isOpen` is true
- **Efficient Updates**: Minimal re-renders through proper state management
- **Memory Management**: Event listeners properly cleaned up

### Image Handling
- **Object Containment**: Maintains aspect ratio without cropping
- **Scalable Display**: Adapts to container size dynamically
- **Error Resilience**: Graceful fallback for missing images

## Accessibility Features

### Keyboard Navigation
- **Escape Key**: Close modal
- **Arrow Keys**: Navigate between images
- **Focus Management**: Proper focus handling (inherited from React)

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper button and heading elements
- **Image Descriptions**: Alt text with fallbacks

### Visual Accessibility
- **High Contrast**: Primary colors provide good contrast
- **Focus Indicators**: Clear visual feedback for keyboard users
- **Readable Text**: Sufficient color contrast ratios

## Error Handling & Edge Cases

### Empty Image Arrays
```typescript
if (!isOpen || images.length === 0) return null;
```
**Behavior**: Prevents rendering when no images available

### Missing Image URLs
```tsx
{selectedImage.file_url ? (
  <img src={selectedImage.file_url} ... />
) : (
  <span className="text-muted-foreground">Image not available</span>
)}
```

### Index Bounds
- **Next/Previous**: Modular arithmetic prevents out-of-bounds errors
- **Initial Index**: Defaults to 0, handles invalid values gracefully

## Testing Considerations

### Interaction Testing
- **Button Clicks**: Previous/Next navigation functionality
- **Thumbnail Selection**: Direct image jumping
- **Close Actions**: Modal dismissal via button and escape key

### State Management Testing
- **Index Updates**: Correct state transitions
- **Modal Lifecycle**: Open/close state management
- **Keyboard Events**: Proper event handling and cleanup

### Responsive Testing
- **Viewport Sizes**: Different screen dimensions
- **Touch Interactions**: Mobile tap targets
- **Keyboard Navigation**: Desktop keyboard accessibility

## Browser Compatibility

### Supported Features
- **CSS Grid**: Modern layout system
- **CSS Flexbox**: Flexible component layouts
- **CSS Custom Properties**: Theme color variables
- **ES6+ JavaScript**: Modern React patterns

### Fallback Considerations
- **Older Browsers**: Graceful degradation through CSS fallbacks
- **Touch Devices**: Touch-friendly button sizes
- **Keyboard Users**: Full keyboard accessibility support

## Related Components

- **[ImageGalleryClient](../ImageGalleryClient.tsx.md)** - Parent component that opens the lightbox
- **[Main Page](../../page.tsx.md)** - Grandparent providing data and layout context

## Future Enhancements

### Potential Features
- **Swipe Gestures**: Touch/swipe navigation for mobile
- **Zoom Functionality**: Click-to-zoom within the lightbox
- **Image Editing**: Basic editing tools (crop, rotate)
- **Sharing**: Social media sharing capabilities
- **Download**: Individual image download functionality

### Performance Improvements
- **Image Preloading**: Preload adjacent images
- **Virtual Scrolling**: For very large image collections
- **Progressive Loading**: Multiple quality levels
- **Memory Management**: Efficient image caching

### UX Improvements
- **Loading States**: Skeleton screens during image transitions
- **Animation**: Smooth transitions between images
- **Gestures**: Pinch-to-zoom on mobile devices
- **Accessibility**: Enhanced screen reader support

## Customization Options

### Theming
- **Colors**: Configurable via CSS custom properties
- **Typography**: Adjustable font sizes and families
- **Spacing**: Customizable padding and margins

### Behavior
- **Navigation**: Configurable wrap-around behavior
- **Keyboard Shortcuts**: Customizable key bindings
- **Animation**: Adjustable transition durations

### Integration
- **Data Sources**: Flexible image data structure
- **Callbacks**: Custom event handlers
- **Styling**: CSS class overrides for customization
