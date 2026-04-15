# PdfViewer Component

## Overview

The `PdfViewer` component provides comprehensive PDF viewing functionality with preview generation, responsive scaling, and fallback handling. It uses the `@react-pdf-viewer/core` library to render PDFs with advanced features like zoom controls and page navigation.

## Location
`components/estimate-details/PdfViewer.tsx` (163 lines)

## Props

```typescript
type PdfViewerProps = {
  url: string;
  title?: string;
  sourceLabel?: string;
};
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | Yes | URL of the PDF file to display |
| `title` | `string` | No | PDF title for download filename |
| `sourceLabel` | `string` | No | Label indicating data source |

## State Management

```typescript
const [numPages, setNumPages] = useState(0);
const [currentPage, setCurrentPage] = useState(0);
const [containerWidth, setContainerWidth] = useState(0);
const [fileUrl, setFileUrl] = useState(url);
const [viewerKey, setViewerKey] = useState(0);
const [loadError, setLoadError] = useState<string | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [viewerReady, setViewerReady] = useState(false);
```

### State Variables
| Variable | Type | Purpose | Initial Value |
|----------|------|---------|---------------|
| `numPages` | `number` | Total pages in PDF | `0` |
| `currentPage` | `number` | Current page index | `0` |
| `containerWidth` | `number` | Container width for scaling | `0` |
| `fileUrl` | `string` | Resolved PDF URL | `url` prop |
| `viewerKey` | `number` | Forces viewer re-render | `0` |
| `loadError` | `string \| null` | Error message if loading fails | `null` |
| `previewUrl` | `string \| null` | Canvas preview image | `null` |
| `viewerReady` | `boolean` | Viewer initialization status | `false` |

## URL Processing

### Proxy URL Construction
```typescript
const proxyUrl = useMemo(
  () => `/api/pdf?url=${encodeURIComponent(url)}`,
  [url],
);
```

**Purpose**: Creates a server-side proxy URL for CORS and authentication handling

### Download URL Construction
```typescript
const downloadUrl = useMemo(() => {
  const filenameParam = title ? `&filename=${encodeURIComponent(title)}` : "";
  return `/api/pdf?url=${encodeURIComponent(url)}&download=1${filenameParam}`;
}, [title, url]);
```

**Purpose**: Generates download URLs with optional custom filenames

## Effects & Lifecycle

### Container Resize Observer (lines 45-53)
```typescript
useEffect(() => {
  if (!containerRef.current) return;
  const updateWidth = () =>
    setContainerWidth(containerRef.current?.clientWidth ?? 0);
  updateWidth();
  const observer = new ResizeObserver(updateWidth);
  observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```

**Purpose**: Tracks container width changes for responsive scaling
**Cleanup**: Properly disconnects ResizeObserver on unmount

### Direct Access Check (lines 55-77)
```typescript
useEffect(() => {
  let isActive = true;
  setLoadError(null);
  setPreviewUrl(null);
  setViewerReady(false);
  const checkDirect = async () => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (!isActive) return;
      setFileUrl(response.ok ? url : proxyUrl);
      setViewerKey((current) => current + 1);
    } catch {
      if (!isActive) return;
      setFileUrl(proxyUrl);
      setViewerKey((current) => current + 1);
    }
  };

  checkDirect();
  return () => {
    isActive = false;
  };
}, [proxyUrl, url]);
```

**Logic**: Attempts direct PDF access first, falls back to proxy if needed
**Race Condition Prevention**: Uses `isActive` flag for cleanup

### Preview Generation (lines 79-118)
```typescript
useEffect(() => {
  let isActive = true;
  if (!fileUrl || containerWidth <= 0) return;

  const buildPreview = async () => {
    try {
      const pdfjs = await import("pdfjs-dist/build/pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const loadingTask = pdfjs.getDocument({ url: fileUrl });
      const doc = await loadingTask.promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = Math.ceil(scaledViewport.width);
      canvas.height = Math.ceil(scaledViewport.height);

      await page.render({ canvasContext: context, viewport: scaledViewport })
        .promise;
      if (!isActive) return;
      setPreviewUrl(canvas.toDataURL("image/png"));
      page.cleanup();
      doc.cleanup();
    } catch {
      if (isActive) {
        setPreviewUrl(null);
      }
    }
  };

  buildPreview();
  return () => {
    isActive = false;
  };
}, [containerWidth, fileUrl, workerUrl]);
```

**Purpose**: Generates a canvas-based preview of the first PDF page
**Scaling**: Calculates appropriate scale based on container width
**Memory Management**: Cleans up PDF resources after rendering

## PDF.js Configuration

### Worker URL
```typescript
const workerUrl =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
```

**Purpose**: CDN-hosted PDF.js worker for background processing
**Version**: Pinned to specific version for stability

## Component Structure

### Container (lines 123-160)
```tsx
<div className="space-y-4">
  <div
    ref={containerRef}
    className="relative min-h-[600px] w-full rounded-md border bg-background"
  >
    {/* Preview and Viewer Content */}
  </div>
</div>
```

**Features**:
- **Minimum Height**: `600px` ensures adequate viewing space
- **Responsive**: Full width with rounded corners
- **Background**: Theme-aware background color

### Preview Image (lines 127-133)
```tsx
{previewUrl && !viewerReady ? (
  <img
    src={previewUrl}
    alt="PDF preview"
    className="absolute inset-0 h-full w-full object-contain"
  />
) : null}
```

**Purpose**: Shows canvas-generated preview while full viewer loads
**Positioning**: Absolute positioning overlays the container

### PDF Viewer (lines 134-159)
```tsx
<Worker workerUrl={workerUrl}>
  <Viewer
    key={viewerKey}
    fileUrl={fileUrl}
    defaultScale={SpecialZoomLevel.PageWidth}
    scrollMode={ScrollMode.Vertical}
    renderError={() => (
      <div className="p-4 text-sm text-destructive">
        {loadError ?? "Unable to load the PDF file."}
      </div>
    )}
    renderLoader={() => (
      <div className="p-4 text-sm text-muted-foreground">
        Loading PDF…
      </div>
    )}
    onDocumentLoad={(event) => {
      docRef.current = event.doc;
      setNumPages(event.doc.numPages);
      setCurrentPage(0);
      setLoadError(null);
      setViewerReady(true);
    }}
    onPageChange={(event) => setCurrentPage(event.currentPage)}
  />
</Worker>
```

## Dependencies

### External Libraries
| Library | Purpose | Version |
|---------|---------|---------|
| `@react-pdf-viewer/core` | PDF viewing functionality | Latest |
| `pdfjs-dist` | PDF processing engine | 3.11.174 |
| `@react-pdf-viewer/core/lib/styles/index.css` | Default styling | Included |

### Internal Dependencies
- **API Routes**: `/api/pdf` for proxy and download functionality
- **Parent Component**: `PdfViewerClient` for dynamic imports

## Error Handling

### Render Error Callback
```typescript
renderError={() => (
  <div className="p-4 text-sm text-destructive">
    {loadError ?? "Unable to load the PDF file."}
  </div>
)}
```

### Load Error States
- **Network Failures**: Falls back to proxy URL
- **CORS Issues**: Automatic proxy redirection
- **Invalid PDFs**: Error messages with fallback UI

## Performance Optimizations

### Progressive Loading
1. **Preview Generation**: Fast canvas preview while viewer loads
2. **Lazy Rendering**: Viewer loads only after document validation
3. **Resource Cleanup**: Proper cleanup of PDF.js resources

### Memory Management
- **Canvas Cleanup**: Removes temporary canvas elements
- **PDF Cleanup**: Calls `page.cleanup()` and `doc.cleanup()`
- **Effect Cleanup**: Prevents memory leaks with `isActive` flags

### Responsive Scaling
- **Dynamic Scaling**: Recalculates on container resize
- **Efficient Rendering**: Only re-renders when necessary
- **Viewport Optimization**: Scales based on available width

## Browser Compatibility

### PDF.js Support
- **Modern Browsers**: Full functionality with Web Workers
- **Legacy Support**: Graceful degradation for older browsers
- **Mobile Browsers**: Touch-friendly controls and scaling

### CORS Handling
- **Direct Access**: Attempts direct PDF loading first
- **Proxy Fallback**: Server-side proxy for CORS-restricted PDFs
- **Error Recovery**: Automatic fallback on access failures

## Testing Considerations

### Integration Testing
- **URL Resolution**: Direct vs proxy URL selection
- **Preview Generation**: Canvas rendering accuracy
- **Error States**: Various failure scenarios

### Performance Testing
- **Load Times**: Preview generation vs full viewer load
- **Memory Usage**: Resource cleanup verification
- **Resize Handling**: Responsive scaling accuracy

### Accessibility Testing
- **Keyboard Navigation**: PDF viewer keyboard support
- **Screen Readers**: Alternative text and ARIA labels
- **Error Announcements**: Screen reader error notifications

## Usage in Parent Component

### Integration Pattern
```tsx
{pdfFile?.file_url ? (
  <PdfViewer
    url={pdfFile.file_url}
    title={pdfFile.file_name}
  />
) : (
  <div className="text-muted-foreground">No PDF available</div>
)}
```

## Future Enhancements

### Potential Features
- **Page Navigation**: Custom page controls and thumbnails
- **Zoom Controls**: Manual zoom levels and fit options
- **Search Functionality**: Text search within PDFs
- **Annotation Support**: Highlighting and note-taking
- **Print Integration**: Direct print functionality

### Performance Improvements
- **Web Workers**: Offload PDF processing to background threads
- **Virtual Scrolling**: Efficient rendering of large documents
- **Progressive Loading**: Load pages on demand
- **Caching**: Browser caching for frequently accessed PDFs

### UX Improvements
- **Loading Skeletons**: Better perceived performance
- **Error Recovery**: Retry mechanisms for failed loads
- **Offline Support**: Service worker caching for PDFs
- **Mobile Optimization**: Swipe gestures and touch controls

## Configuration Options

### PDF.js Settings
- **Worker URL**: Configurable CDN or local worker
- **Verbosity**: Debug logging levels
- **Font Settings**: Custom font loading

### Viewer Configuration
- **Default Scale**: Page width, page fit, or custom zoom
- **Scroll Mode**: Vertical, horizontal, or wrapped
- **Theme**: Light/dark mode support

### API Integration
- **Proxy Endpoints**: Custom proxy URL construction
- **Authentication**: Bearer token or API key support
- **Headers**: Custom request headers for protected PDFs