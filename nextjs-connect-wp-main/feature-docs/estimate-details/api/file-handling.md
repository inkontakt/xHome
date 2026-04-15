# File Handling & Processing

## Overview

The estimate details feature handles multiple file types including images and PDFs. This document covers file processing, validation, routing, and display strategies used throughout the application.

## File Type Detection

### Detection Functions

#### PDF Detection
```typescript
const isPdfFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().includes("pdf") ||
  (file.file_name || "").toLowerCase().endsWith(".pdf");
```

**Logic**: Checks both MIME type and file extension for maximum compatibility
**Usage**: Determines which files to display in PDF viewer
**Fallback**: Extension check handles cases where MIME type is incorrect

#### Image Detection
```typescript
const isImageFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().startsWith("image/");
```

**Logic**: Checks MIME type prefix for all image formats
**Supported Types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, etc.
**Usage**: Determines which files to display in image gallery

### File Separation Logic
```typescript
// Extract single PDF (first one found)
const pdfFile = files?.find(isPdfFile) ?? null;

// Extract all images
const imageFiles = (files ?? []).filter(isImageFile);
```

**Strategy**: One PDF displayed in viewer, all images shown in gallery

## File Storage & URLs

### Supabase Storage Structure
```
supabase-bucket/
├── estimates/
│   ├── tenant-{tenant_id}/
│   │   ├── submission-{submission_id}/
│   │   │   ├── image1.jpg
│   │   │   ├── image2.png
│   │   │   └── document.pdf
```

### URL Format
```typescript
interface SubmissionFile {
  file_url: string; // https://xxxxx.supabase.co/storage/v1/object/public/bucket/path/file.jpg
}
```

**Components**:
- **Base URL**: Supabase project URL
- **Storage Path**: `/storage/v1/object/public/`
- **Bucket**: Public bucket name
- **File Path**: Tenant/submission specific path

## File Processing Pipeline

### 1. Database Retrieval
```typescript
const { data: files } = await supabase
  .from("form_submission_files")
  .select("file_name, file_url, file_mime_type, file_position")
  .eq("submission_id", submissionId!)
  .order("file_position", { ascending: true });
```

**Ordered Retrieval**: Files sorted by `file_position` for consistent display

### 2. Type-Based Routing
```typescript
// PDF files → PdfViewerClient
{pdfFile?.file_url && (
  <PdfViewerClient url={pdfFile.file_url} />
)}

// Image files → ImageGalleryClient
<ImageGalleryClient
  imageFiles={imageFiles}
  showDynamic={showDynamic}
/>
```

### 3. Display Components

#### PDF Display Flow
```
PdfViewerClient (Wrapper)
    ↓ Dynamic Import
PdfViewer (Main Component)
    ↓ Direct URL or Proxy
PDF File (Supabase Storage)
```

#### Image Display Flow
```
ImageGalleryClient
    ↓ Image URLs
ImageLightbox (Modal)
    ↓ Direct URLs
Image Files (Supabase Storage)
```

## Image Processing & Display

### Thumbnail Generation
- **Client-Side**: No thumbnail generation (uses full images)
- **Lazy Loading**: Images load as they enter viewport
- **Aspect Ratios**: Maintained with `aspect-square` containers

### Image Optimization
```tsx
<img
  src={imageUrl}
  alt={imageName}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

**Techniques**:
- **Object Cover**: Maintains aspect ratio, fills container
- **Lazy Loading**: Performance optimization
- **Responsive Sizing**: Scales with container

### Lightbox Scaling
```tsx
<img
  src={imageUrl}
  alt={imageName}
  className="max-w-full h-full object-contain"
/>
```

**Behavior**:
- **`object-contain`**: Shows full image, maintains aspect ratio
- **`max-w-full h-full`**: Scales up to fill available space
- **Container Constraints**: `min-h-[400px]`, `max-h-[calc(100vh-200px)]`

## PDF Processing & Display

### PDF.js Integration
```typescript
// Worker configuration
const workerUrl = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

// Document loading
const loadingTask = pdfjs.getDocument({ url: fileUrl });
const doc = await loadingTask.promise;
```

### Preview Generation
```typescript
// Canvas-based first page preview
const page = await doc.getPage(1);
const viewport = page.getViewport({ scale: 1 });
const scale = containerWidth / viewport.width;
const scaledViewport = page.getViewport({ scale });

// Render to canvas
await page.render({
  canvasContext: context,
  viewport: scaledViewport
}).promise;

const previewUrl = canvas.toDataURL("image/png");
```

**Purpose**: Fast preview while full viewer loads

### Viewer Configuration
```tsx
<Viewer
  fileUrl={fileUrl}
  defaultScale={SpecialZoomLevel.PageWidth}
  scrollMode={ScrollMode.Vertical}
  // Error and loading handlers
/>
```

**Features**:
- **Page Width Scaling**: Fits page width to container
- **Vertical Scrolling**: Natural document reading
- **Error Handling**: Graceful failure with user feedback

## CORS & Proxy Handling

### Direct Access Attempt
```typescript
// Try direct PDF access first
const response = await fetch(url, { method: "HEAD" });
const fileUrl = response.ok ? url : proxyUrl;
```

### Proxy Fallback
```typescript
// Server-side proxy for CORS issues
const proxyUrl = `/api/pdf?url=${encodeURIComponent(url)}`;
```

### Download Handling
```typescript
const downloadUrl = `/api/pdf?url=${encodeURIComponent(url)}&download=1&filename=${title}`;
```

## Error Handling & Fallbacks

### File Loading Errors
```tsx
// PDF viewer error
renderError={() => (
  <div className="text-destructive">
    Unable to load PDF file.
  </div>
)}

// Image loading error (implicit)
{image.file_url ? (
  <img src={image.file_url} />
) : (
  <div>Image URL missing</div>
)}
```

### Network Failures
```tsx
// Proxy fallback for network issues
const checkDirect = async () => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok ? url : proxyUrl;
  } catch {
    return proxyUrl; // Fallback on any error
  }
};
```

## Performance Optimization

### Image Loading
- **Lazy Loading**: `loading="lazy"` for below-fold images
- **Progressive Enhancement**: Images load without blocking
- **Error Resilience**: Missing images show fallback UI

### PDF Loading
- **Preview First**: Canvas preview loads instantly
- **Progressive Rendering**: Viewer loads in background
- **Resource Cleanup**: PDF.js resources properly disposed

### Memory Management
```typescript
// Canvas cleanup
canvas.remove();

// PDF cleanup
page.cleanup();
doc.cleanup();
```

## File Type Support

### Supported Image Formats
- **JPEG/JPG**: `image/jpeg`
- **PNG**: `image/png`
- **GIF**: `image/gif`
- **WebP**: `image/webp`
- **SVG**: `image/svg+xml`

### Supported Document Formats
- **PDF**: `application/pdf`
- **Future**: DOC, DOCX, XLS, XLSX (potential extensions)

### MIME Type Validation
```typescript
// Strict MIME type checking
const isValidImage = (mimeType: string) =>
  mimeType.startsWith('image/') &&
  ['jpeg', 'png', 'gif', 'webp'].includes(mimeType.split('/')[1]);
```

## Security Considerations

### File Upload Validation
- **MIME Type Checking**: Server-side validation
- **File Size Limits**: Prevent abuse
- **Path Traversal**: Sanitize file paths
- **Malware Scanning**: Optional virus checking

### Access Control
- **Public URLs**: Files accessible without authentication
- **Tenant Isolation**: Files scoped to tenant directories
- **Temporary URLs**: Time-limited access for sensitive files

## User Experience Patterns

### Loading States
```tsx
// PDF loading
{previewUrl && !viewerReady ? (
  <img src={previewUrl} alt="PDF preview" />
) : null}

// General loading
<div className="text-muted-foreground">Loading...</div>
```

### Empty States
```tsx
// No images
<div className="text-muted-foreground">
  Image thumbnails will appear here once linked to Supabase.
</div>

// No PDF
<span className="text-muted-foreground">
  PDF content will render here once connected.
</span>
```

### Error States
```tsx
// File not found
<div className="text-destructive">
  File not available or access denied.
</div>

// Network error
<div className="text-destructive">
  Unable to load file. Please check your connection.
</div>
```

## Future Enhancements

### Advanced File Processing
- **Image Resizing**: Automatic thumbnail generation
- **Format Conversion**: PDF to images, image format conversion
- **OCR**: Text extraction from images/PDFs
- **Compression**: Automatic file size optimization

### Enhanced Display Features
- **Zoom Controls**: Manual zoom for images
- **Image Editing**: Basic crop/rotate functionality
- **PDF Annotations**: Highlight and comment features
- **Bulk Operations**: Multi-file selection and actions

### Performance Improvements
- **Progressive Loading**: Load file metadata first
- **Caching Strategy**: Browser caching for frequently accessed files
- **CDN Optimization**: Global distribution for faster access
- **Background Processing**: Queue system for large file operations

### Analytics & Monitoring
- **File Access Tracking**: Most viewed files
- **Load Time Monitoring**: Performance metrics
- **Error Rate Tracking**: File loading success rates
- **Storage Analytics**: Usage patterns and growth trends

## Testing Strategies

### File Type Testing
```typescript
// Test various MIME types
const testFiles: SubmissionFile[] = [
  { file_mime_type: 'image/jpeg', file_name: 'test.jpg' },
  { file_mime_type: 'application/pdf', file_name: 'test.pdf' },
  { file_mime_type: 'image/png', file_name: 'test.png' }
];

// Verify detection functions
testFiles.forEach(file => {
  console.log(`${file.file_name}: PDF=${isPdfFile(file)}, Image=${isImageFile(file)}`);
});
```

### Error Scenario Testing
- **Network failures**: Test offline behavior
- **Invalid URLs**: Test error handling
- **Large files**: Test loading performance
- **Unsupported formats**: Test graceful degradation

### Performance Testing
- **Load times**: Measure file loading speeds
- **Memory usage**: Monitor resource consumption
- **Scalability**: Test with many files
- **Concurrent loading**: Test multiple file loading