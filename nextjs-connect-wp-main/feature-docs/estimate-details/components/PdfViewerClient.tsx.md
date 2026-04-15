# PdfViewerClient Component

## Overview

The `PdfViewerClient` component is a lightweight wrapper that provides dynamic imports for the main PDF viewer functionality. It serves as an entry point for PDF rendering while enabling code splitting and lazy loading for better performance.

## Location
`components/estimate-details/PdfViewerClient.tsx` (12 lines)

## Architecture

This component acts as a thin wrapper around the more complex `PdfViewer` component, providing the following benefits:

- **Code Splitting**: Prevents the heavy PDF viewer library from being included in the initial bundle
- **Lazy Loading**: Loads PDF functionality only when needed
- **SSR Compatibility**: Disables server-side rendering to prevent hydration issues
- **Loading States**: Provides a simple loading indicator during dynamic import

## Implementation

```typescript
"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="text-sm text-muted-foreground">Loading PDF…</div>
  ),
});

export default PdfViewer;
```

## Dynamic Import Configuration

### Options
- **`ssr: false`**: Prevents server-side rendering of the PDF viewer
- **`loading`**: Custom loading component during import
- **Default Error Handling**: Falls back to Next.js default error boundary

### Loading Component
```tsx
<div className="text-sm text-muted-foreground">Loading PDF…</div>
```

**Styling**: Uses muted foreground color for subtle loading indication

## Dependencies

### Internal Dependencies
| Import | Purpose | Location |
|--------|---------|----------|
| `./PdfViewer` | Main PDF viewer component | `./PdfViewer.tsx` |
| `dynamic` | Next.js dynamic import utility | `next/dynamic` |

### External Dependencies
- **Next.js**: Dynamic imports and SSR control
- **React**: Client component functionality

## Performance Benefits

### Bundle Size Optimization
- **Lazy Loading**: PDF viewer code loads only when component mounts
- **Code Splitting**: Separates heavy PDF libraries from main bundle
- **Initial Load**: Faster page load times without PDF functionality

### Runtime Benefits
- **On-Demand Loading**: Loads when PDF viewing is actually needed
- **Memory Efficiency**: PDF libraries not loaded for non-PDF pages
- **Network Efficiency**: Reduces initial JavaScript payload

## Usage Context

### Parent Component Integration
Used in `app/estimate-details/page.tsx` within the PDF section:

```tsx
{showDynamic && pdfFile?.file_url ? (
  <PdfViewerClient url={pdfFile.file_url} />
) : (
  // Placeholder content
)}
```

### Props Delegation
All props passed to `PdfViewerClient` are forwarded to the underlying `PdfViewer` component.

## Error Handling

### Import Failures
- **Dynamic Import**: Falls back to Next.js error boundary
- **Loading Errors**: Graceful degradation with error messages
- **Network Issues**: Handled by underlying PdfViewer component

## Browser Compatibility

### Client-Only Execution
- **SSR Disabled**: Prevents server-side rendering issues
- **Client Hydration**: Properly hydrates on client-side
- **Progressive Enhancement**: Works with JavaScript disabled (shows loading state)

## Testing Considerations

### Dynamic Import Testing
- **Loading States**: Verify loading indicator appears
- **Import Success**: Confirm PdfViewer renders correctly
- **Import Failure**: Test error boundary behavior

### Integration Testing
- **Props Passing**: Ensure props reach PdfViewer component
- **Conditional Rendering**: Test show/hide behavior in parent

## Relationship to PdfViewer

### Architecture Pattern
```
PdfViewerClient (Wrapper)
    ↓ Dynamic Import
PdfViewer (Main Component)
    ↓ Uses
@react-pdf-viewer/core (Library)
```

### Responsibilities
- **PdfViewerClient**: Import management and loading states
- **PdfViewer**: Actual PDF rendering and interaction logic

## Future Enhancements

### Potential Improvements
- **Error Boundaries**: Custom error handling for import failures
- **Retry Logic**: Automatic retry for failed dynamic imports
- **Preloading**: Optional preloading for expected PDF views
- **Fallback UI**: Alternative display when JavaScript is disabled

### Performance Optimizations
- **Preload Hints**: Resource hints for PDF viewer assets
- **Caching Strategy**: Service worker caching for PDF libraries
- **Bundle Analysis**: Monitor and optimize dynamic chunk sizes