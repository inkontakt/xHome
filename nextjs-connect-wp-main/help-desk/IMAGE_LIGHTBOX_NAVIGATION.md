# Image Lightbox Navigation Documentation

## Overview

The image lightbox system in the inquiries feature provides a full-screen photo viewing experience with intuitive navigation controls. Users can view inquiry photos in a modal overlay with smooth navigation between images.

## Architecture

The lightbox consists of two main components:
- `InquiryPhotoGallery.tsx` - Grid display with "View Details" triggers
- `InquiryPhotoDetailModal.tsx` - Full-screen modal with navigation controls

## Image Display

### Grid Layout
Images are displayed in a responsive grid layout:
- **Small screens**: 2 columns
- **Medium screens**: 3 columns
- **Large screens**: 4 columns

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Photo items */}
</div>
```

### Image Container
Each image uses a square aspect ratio container with proper scaling:

```tsx
<div className="relative aspect-square overflow-hidden bg-muted">
  <img
    src={img.url}
    alt={`Photo ${img.index}`}
    className="w-full h-full object-cover hover:scale-105 transition-transform"
    loading="lazy"
  />
</div>
```

### Photo Numbering
Photos are numbered sequentially (1, 2, 3...) with a badge overlay:
- Positioned at bottom-right corner
- White background with black text for contrast
- Font weight: bold, Size: small

```tsx
<div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-sm px-3 py-2">
  <span className="text-sm font-semibold text-foreground">
    Photo #{img.index}
  </span>
</div>
```

## Navigation System

### Opening the Lightbox
Users open the lightbox by clicking the "View Details" button that appears on hover:

```tsx
<button
  onClick={() => {
    setModalStartIndex(img.index - 1);
    setIsModalOpen(true);
  }}
  className="flex items-center gap-2 px-2 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90"
>
  <Maximize2 size={12} />
  View Details
</button>
```

### Modal Layout
The full-screen modal uses:
- Fixed positioning with full viewport coverage
- Semi-transparent background with blur effect
- Flexbox layout for header, content, and navigation

```tsx
<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden">
  <div className="h-full flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
      {/* Content */}
    </div>
    {/* Main content area */}
  </div>
</div>
```

### Photo Navigation

#### Previous/Next Buttons
Large navigation buttons positioned at the bottom of the image area:

```tsx
<div className="flex items-center justify-between gap-3">
  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
    <ChevronLeft size={16} />
    Previous
  </button>
  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
    Next
    <ChevronRight size={16} />
  </button>
</div>
```

#### Thumbnail Strip
Horizontal scrollable thumbnail strip below the main image:
- Small square thumbnails (64x64px)
- Click to jump to specific photo
- Current photo highlighted with blue border
- Smooth scrolling with overflow-x-auto

```tsx
<div className="flex gap-2 overflow-x-auto pb-2">
  {annotatedImages.map((img, idx) => (
    <button
      key={idx}
      onClick={() => setSelectedIndex(idx)}
      className={`relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
        idx === selectedIndex
          ? 'border-primary'
          : 'border-border hover:border-muted-foreground'
      }`}
    >
      <img src={img.url} alt={`Thumbnail ${img.number}`} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 right-0 bg-foreground text-background text-xs font-bold w-5 h-5 flex items-center justify-center">
        {img.number}
      </div>
    </button>
  ))}
</div>
```

### Keyboard Navigation
- **Escape key**: Closes the modal
- Event listener attached to document for global keyboard handling

```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);
```

### Image Scaling and Display
Main image display uses responsive container with proper object scaling:

```tsx
<div className="flex-1 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
  <img
    src={selectedImage.url}
    alt={`Photo ${selectedImage.number}`}
    className="w-full h-full object-contain"
  />
</div>
```

- `object-contain`: Maintains aspect ratio, fits entire image within container
- Centered both horizontally and vertically
- Gray background (`bg-muted`) when image loads or if no image available

## Responsive Behavior

### Breakpoints
- **Mobile (< 768px)**: 2-column grid, stacked layout
- **Tablet (≥ 768px)**: 3-column grid
- **Desktop (≥ 1024px)**: 4-column grid

### Modal Responsiveness
- Header remains fixed height
- Main content area flexes to fill available space
- Image container maintains aspect ratio
- Navigation buttons stack appropriately on smaller screens

## State Management

### Navigation State
```tsx
const [selectedIndex, setSelectedIndex] = useState(initialIndex);
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalStartIndex, setModalStartIndex] = useState(0);
```

### Navigation Logic
```tsx
const handleNextPhoto = () => {
  setSelectedIndex((prev) => (prev + 1) % annotatedImages.length);
};

const handlePrevPhoto = () => {
  setSelectedIndex((prev) =>
    prev === 0 ? annotatedImages.length - 1 : prev - 1
  );
};
```

## Performance Considerations

- Lazy loading for grid images: `loading="lazy"`
- Hover scale effect with CSS transitions: `hover:scale-105 transition-transform`
- Efficient re-rendering with proper React keys and memoization
- Background blur effect for modal overlay

## Accessibility

- Semantic button elements with proper labels
- Keyboard navigation support (Escape to close)
- Screen reader friendly alt text for images
- Focus management within modal
- Proper ARIA labels for navigation controls

## Usage Flow

1. User views photo grid in inquiry details
2. Hovers over photo to reveal "View Details" button
3. Clicks button to open full-screen modal
4. Navigates using prev/next buttons or thumbnail strip
5. Closes modal with close button or Escape key

This navigation system provides an intuitive, keyboard-accessible way to browse through inquiry photos with smooth transitions and responsive design.