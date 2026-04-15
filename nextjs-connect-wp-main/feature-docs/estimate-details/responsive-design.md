# Responsive Design & Layout System

## Overview

The estimate details feature implements a mobile-first responsive design that adapts seamlessly across different screen sizes. The layout uses CSS Grid with strategic breakpoints and ordering to optimize the user experience for both mobile and desktop viewing.

## Layout Architecture

### Core Layout Container
```tsx
<div className="grid w-full items-start gap-6 lg:grid-cols-2">
  {/* Content Sections */}
</div>
```

**CSS Grid Configuration**:
- **Base**: Single column (mobile-first)
- **Large screens** (`lg:`): Two-column layout
- **Alignment**: `items-start` (top-aligned)
- **Spacing**: `gap-6` (1.5rem consistent spacing)

## Responsive Breakpoints

### Tailwind Breakpoint System
| Breakpoint | Prefix | Min Width | Behavior |
|------------|--------|-----------|----------|
| **Default** | - | 0px | Single column, images first |
| **Large** | `lg:` | 1024px | Two columns, PDF left, images right |

### Custom Breakpoint Strategy
```typescript
// Breakpoint logic in practice
// Mobile (< 1024px): Single column
// - ImageGalleryClient (first)
// - PDF Section (second)

// Desktop (≥ 1024px): Two columns
// - PDF Section (left, order-1)
// - ImageGalleryClient (right, order-2)
```

## Component Ordering Strategy

### Mobile Layout (Natural Order)
```tsx
<div className="grid w-full items-start gap-6 lg:grid-cols-2">
  {/* Images appear first on mobile */}
  <ImageGalleryClient />

  {/* PDF appears second on mobile */}
  <section>
    {/* PDF Content */}
  </section>
</div>
```

**Behavior**: Natural document order, images prioritized for mobile users

### Desktop Layout (CSS Grid Order)
```tsx
<div className="grid w-full items-start gap-6 lg:grid-cols-2">
  {/* Images container with desktop ordering */}
  <div className="lg:order-2 lg:sticky lg:top-24 self-start">
    <ImageGalleryClient />
  </div>

  {/* PDF section with desktop ordering */}
  <section className="lg:order-1">
    {/* PDF Content */}
  </section>
</div>
```

**CSS Grid Order**:
- `lg:order-1`: PDF section appears first (left column)
- `lg:order-2`: Images section appears second (right column)

### Sticky Image Column (Desktop)
```tsx
<div className="lg:order-2 lg:sticky lg:top-24 self-start">
  <ImageGalleryClient />
</div>
```

**Behavior**:
- **Sticky on Desktop**: The image column stays visible while the PDF scrolls
- **Header Offset**: `lg:top-24` keeps the gallery below the sticky header

## Component-Specific Responsiveness

### ImageGalleryClient Responsive Behavior

#### Grid Layout
```tsx
<div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {/* Image thumbnails */}
</div>
```

**Responsive Columns**:
- **Mobile** (`grid-cols-2`): 2 columns
- **Tablet** (`md:grid-cols-3`): 3 columns
- **Desktop** (`lg:grid-cols-4`): 4 columns

#### Image Aspect Ratios
```tsx
<button className="relative aspect-square overflow-hidden">
  <img className="w-full h-full object-cover" />
</button>
```

**Consistent Sizing**: `aspect-square` maintains 1:1 ratios across all screen sizes

### ImageLightbox Responsive Behavior

#### Container Constraints
```tsx
<div className="flex-1 flex items-center justify-center bg-[#f1f9f] rounded-lg overflow-hidden mx-6 my-4 max-h-[calc(100vh-200px)] min-h-[400px]">
  <img className="max-w-full h-full object-contain" />
</div>
```

**Responsive Scaling**:
- **Width**: `max-w-full` constrains to container
- **Height**: `h-full` allows upscaling to fill container
- **Container**: `min-h-[400px]` ensures minimum display size

#### Viewport-Aware Sizing
```css
max-h-[calc(100vh-200px)]
```
**Calculation**: Viewport height minus header, navigation, and margins

### PdfViewerClient Responsive Behavior

#### Container Adaptation
```tsx
<div className="relative min-h-[600px] w-full rounded-md border bg-background">
  {/* PDF Viewer */}
</div>
```

**Responsive Features**:
- **Full Width**: `w-full` adapts to container
- **Minimum Height**: `min-h-[600px]` ensures readability
- **Flexible Content**: PDF viewer handles internal scaling

## Mobile-First Design Principles

### Content Prioritization
```typescript
// Mobile: Images prioritized for visual impact
// Desktop: PDF prioritized for document reading

// Mobile order: Images → PDF
// Desktop order: PDF → Images
```

**Rationale**:
- **Mobile**: Visual content (images) loads first for better engagement
- **Desktop**: Document content (PDF) positioned for focused reading

### Touch-Friendly Interactions
```tsx
// Button sizing appropriate for touch
<button className="flex-1 flex items-center justify-center gap-2 px-3 py-2">
  {/* Adequate touch targets */}
</button>
```

**Touch Considerations**:
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Swipe-friendly image navigation

## CSS Grid Advanced Features

### Grid Template Areas (Conceptual)
```css
/* Logical layout structure */
.grid-template-areas:
  "images"    /* Mobile: single column */
  "pdf";

@media (min-width: 1024px) {
  .grid-template-areas:
    "pdf images";  /* Desktop: two columns */
}
```

### Order Property Benefits
```css
/* Visual reordering without DOM changes */
.images-section { order: 2; }  /* Appears second visually */
.pdf-section { order: 1; }     /* Appears first visually */
```

**Advantages**:
- Maintains semantic HTML structure
- Preserves accessibility and SEO
- Enables complex responsive layouts
- No JavaScript manipulation required

## Performance Considerations

### Responsive Image Loading
```tsx
<img
  src={imageUrl}
  alt={imageAlt}
  className="w-full h-full object-cover"
  loading="lazy"  // Progressive loading
/>
```

**Loading Strategy**:
- **Lazy Loading**: Images load as they enter viewport
- **Progressive Enhancement**: Better perceived performance
- **Bandwidth Optimization**: Reduces initial page load

### CSS Grid Performance
- **GPU Acceleration**: CSS Grid uses hardware acceleration
- **Layout Stability**: Predictable layout calculations
- **Minimal Repaints**: Efficient rendering pipeline

## Accessibility & UX

### Keyboard Navigation
```tsx
// Lightbox keyboard support
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': prevImage(); break;
      case 'ArrowRight': nextImage(); break;
    }
  };
}, []);
```

**Accessibility Features**:
- Full keyboard navigation in lightbox
- Proper ARIA labels and roles
- Focus management and screen reader support

### Touch Gestures (Future Enhancement)
```typescript
// Potential mobile enhancements
const handleSwipe = (direction: 'left' | 'right') => {
  if (direction === 'left') nextImage();
  if (direction === 'right') prevImage();
};
```

## Browser Compatibility

### CSS Grid Support
- **Modern Browsers**: Full CSS Grid support (Chrome, Firefox, Safari, Edge)
- **Legacy Browsers**: Graceful fallback to flexbox or floats
- **Mobile Browsers**: Excellent support across iOS Safari, Chrome Mobile

### Flexbox Fallback
```css
/* Fallback for older browsers */
@supports not (display: grid) {
  .responsive-grid {
    display: flex;
    flex-wrap: wrap;
  }
}
```

## Testing Strategy

### Breakpoint Testing
```typescript
// Test different viewport sizes
const breakpoints = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

breakpoints.forEach(({ width, height }) => {
  // Test layout at each breakpoint
  setViewport(width, height);
  expect(getGridColumns()).toBe(expectedColumns);
});
```

### Interaction Testing
```typescript
// Test responsive interactions
describe('Responsive Interactions', () => {
  test('lightbox keyboard navigation on mobile', () => {
    // Test touch and keyboard events
  });

  test('grid layout changes at breakpoints', () => {
    // Test CSS Grid responsive behavior
  });
});
```

### Performance Testing
```typescript
// Test loading performance across devices
describe('Performance', () => {
  test('image loading on slow connections', () => {
    // Simulate slow network
    expect(imageLoadTime).toBeLessThan(3000);
  });

  test('layout shifts at breakpoints', () => {
    // Ensure no layout shift during transitions
    expect(layoutShift).toBe(0);
  });
});
```

## Future Enhancements

### Advanced Responsive Features
```tsx
// Potential container queries
@container (min-width: 500px) {
  .image-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
```

### Dynamic Breakpoints
```typescript
// Content-aware breakpoints
const getDynamicBreakpoint = (contentWidth: number) => {
  if (contentWidth < 600) return 'mobile';
  if (contentWidth < 1024) return 'tablet';
  return 'desktop';
};
```

### Adaptive Layouts
```tsx
// Content-based layout switching
const layoutMode = imageCount > 10 ? 'compact' : 'spacious';
const gridClasses = layoutMode === 'compact'
  ? 'grid-cols-6 gap-2'
  : 'grid-cols-4 gap-4';
```

## Customization Options

### Theme Integration
```tsx
// Theme-aware responsive classes
<div className={`
  grid gap-6
  ${theme.breakpoints.mobile}:grid-cols-1
  ${theme.breakpoints.tablet}:grid-cols-2
  ${theme.breakpoints.desktop}:grid-cols-3
`}>
```

### Configuration-Driven Layouts
```typescript
// Configurable breakpoints
const layoutConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440
  },
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  }
};
```

## Maintenance Guidelines

### Breakpoint Updates
- Test all breakpoints when modifying
- Update documentation with changes
- Consider user testing for UX impact
- Monitor performance metrics

### Layout Testing
- Visual regression testing
- Cross-browser compatibility
- Touch device testing
- Accessibility audits

### Performance Monitoring
- Layout shift monitoring
- Loading performance tracking
- Memory usage analysis
- Battery impact on mobile devices

This responsive design system ensures optimal user experience across all devices while maintaining clean, maintainable code and excellent performance characteristics.
