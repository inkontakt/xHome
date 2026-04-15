# File Type Helper Functions

## Overview

The estimate details feature uses several utility functions for file type detection and processing. These functions provide reliable MIME type checking and file routing logic used throughout the application.

## Core Functions

### `isPdfFile(file: SubmissionFile): boolean`

**Location**: `app/estimate-details/page.tsx:34-37`

**Purpose**: Determines if a file is a PDF document for appropriate routing to PDF viewer

**Implementation**:
```typescript
const isPdfFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().includes("pdf") ||
  (file.file_name || "").toLowerCase().endsWith(".pdf");
```

**Parameters**:
- `file`: `SubmissionFile` object containing file metadata

**Returns**: `boolean` - `true` if file is detected as PDF

**Detection Logic**:
1. **Primary**: Check if `file_mime_type` contains "pdf" (case-insensitive)
2. **Fallback**: Check if `file_name` ends with ".pdf" (case-insensitive)
3. **Safety**: Uses nullish coalescing (`|| ""`) for undefined values

**Usage Examples**:
```typescript
// Find first PDF in file array
const pdfFile = files?.find(isPdfFile) ?? null;

// Check if specific file is PDF
if (isPdfFile(someFile)) {
  // Handle as PDF
}
```

**Edge Cases**:
- **Null/Undefined**: Safe handling with empty string fallback
- **Mixed Case**: Case-insensitive matching
- **Extension Only**: Works when MIME type is missing/incorrect
- **Multiple PDFs**: Returns first match in array

### `isImageFile(file: SubmissionFile): boolean`

**Location**: `app/estimate-details/page.tsx:38-40`

**Purpose**: Determines if a file is an image for routing to image gallery

**Implementation**:
```typescript
const isImageFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().startsWith("image/");
```

**Parameters**:
- `file`: `SubmissionFile` object containing file metadata

**Returns**: `boolean` - `true` if file is detected as image

**Detection Logic**:
1. **MIME Type Check**: Verifies `file_mime_type` starts with "image/"
2. **Safety**: Uses nullish coalescing for undefined values
3. **No Extension Fallback**: Relies solely on MIME type

**Supported Image Types**:
- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/gif` - GIF images
- `image/webp` - WebP images
- `image/svg+xml` - SVG images
- `image/bmp` - BMP images
- `image/tiff` - TIFF images

**Usage Examples**:
```typescript
// Filter all images from file array
const imageFiles = (files ?? []).filter(isImageFile);

// Count images in collection
const imageCount = files.filter(isImageFile).length;
```

**Why No Extension Check**:
- **Reliability**: MIME types are more accurate than extensions
- **Security**: Extensions can be spoofed, MIME types are validated
- **Consistency**: Server-provided MIME types are trustworthy

## Type Definitions

### `SubmissionFile` Interface
```typescript
interface SubmissionFile {
  file_name: string | null;
  file_url: string | null;
  file_mime_type: string | null;
  file_position: number | null;
}
```

**Fields Used by Helpers**:
- `file_mime_type`: Primary detection mechanism
- `file_name`: Fallback for PDF detection
- `file_url`: Used by components (not helpers)

## Processing Pipeline

### File Separation Logic
```typescript
// 1. Retrieve all files from database
const { data: files } = await supabase
  .from("form_submission_files")
  .select("*")
  .eq("submission_id", submissionId!)
  .order("file_position", { ascending: true });

// 2. Separate by type
const pdfFile = files?.find(isPdfFile) ?? null;
const imageFiles = (files ?? []).filter(isImageFile);

// 3. Route to appropriate components
// PDF → PdfViewerClient
// Images → ImageGalleryClient
```

### Component Integration
```tsx
// PDF Display
{pdfFile?.file_url && (
  <PdfViewerClient url={pdfFile.file_url} />
)}

// Image Gallery
<ImageGalleryClient
  imageFiles={imageFiles}
  showDynamic={showDynamic}
/>
```

## Error Handling & Safety

### Null Safety
```typescript
// Both functions handle null/undefined safely
isPdfFile(null);      // Returns false
isPdfFile(undefined); // Returns false
isPdfFile({});        // Returns false
```

### Empty Arrays
```typescript
// Safe with empty arrays
const files: SubmissionFile[] = [];
const pdfFile = files.find(isPdfFile);     // undefined
const imageFiles = files.filter(isImageFile); // []
```

### Malformed Data
```typescript
// Handles missing properties
const file = { file_mime_type: null, file_name: null };
isPdfFile(file);   // false (safe)
isImageFile(file); // false (safe)
```

## Performance Considerations

### Time Complexity
- **Both functions**: O(1) - Constant time operations
- **Array operations**: O(n) for `find()` and `filter()`
- **No loops**: Pure functional approach

### Memory Usage
- **No additional memory**: Functions don't create new data structures
- **String operations**: Minimal temporary string allocations
- **Safe for large arrays**: Can handle thousands of files efficiently

### Optimization Opportunities
```typescript
// Potential memoization for repeated calls
const memoizedIsPdfFile = useMemo(() =>
  (file: SubmissionFile) => isPdfFile(file),
  []
);

// Or pre-compute during data fetching
const processedFiles = files.map(file => ({
  ...file,
  isPdf: isPdfFile(file),
  isImage: isImageFile(file)
}));
```

## Testing & Validation

### Unit Tests
```typescript
describe('File Type Helpers', () => {
  describe('isPdfFile', () => {
    test('detects PDF by MIME type', () => {
      const file = { file_mime_type: 'application/pdf' };
      expect(isPdfFile(file)).toBe(true);
    });

    test('detects PDF by extension', () => {
      const file = { file_name: 'document.PDF' };
      expect(isPdfFile(file)).toBe(true);
    });

    test('case insensitive', () => {
      const file = { file_mime_type: 'APPLICATION/PDF' };
      expect(isPdfFile(file)).toBe(true);
    });
  });

  describe('isImageFile', () => {
    test('detects various image types', () => {
      const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      types.forEach(type => {
        expect(isImageFile({ file_mime_type: type })).toBe(true);
      });
    });

    test('rejects non-images', () => {
      const file = { file_mime_type: 'application/pdf' };
      expect(isImageFile(file)).toBe(false);
    });
  });
});
```

### Edge Case Testing
```typescript
// Comprehensive test cases
const testCases = [
  { input: null, pdf: false, image: false },
  { input: {}, pdf: false, image: false },
  { input: { file_mime_type: 'image/jpeg' }, pdf: false, image: true },
  { input: { file_mime_type: 'application/pdf' }, pdf: true, image: false },
  { input: { file_name: 'test.pdf' }, pdf: true, image: false },
  { input: { file_mime_type: 'IMAGE/PNG' }, pdf: false, image: true },
];
```

## Future Enhancements

### Extended File Type Support
```typescript
// Potential additions
const isDocumentFile = (file: SubmissionFile) =>
  ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    .includes(file.file_mime_type || '');

const isSpreadsheetFile = (file: SubmissionFile) =>
  ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    .includes(file.file_mime_type || '');

const isVideoFile = (file: SubmissionFile) =>
  (file.file_mime_type || '').startsWith('video/');
```

### Advanced Detection
```typescript
// File signature detection (magic numbers)
const getFileTypeFromSignature = async (fileUrl: string) => {
  const response = await fetch(fileUrl, { method: 'HEAD' });
  // Check Content-Type header
  // Fallback to extension analysis
};
```

### Configuration-Based Detection
```typescript
// Configurable file type definitions
const FILE_TYPE_CONFIG = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
  images: {
    mimeTypes: ['image/*'], // Wildcard support
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  }
};

const createTypeChecker = (config: typeof FILE_TYPE_CONFIG) =>
  (file: SubmissionFile) => {
    // Dynamic type checking based on config
  };
```

## Migration & Compatibility

### Version Compatibility
- **Current**: Supports all modern image formats and PDF
- **Legacy**: Handles older MIME type variations
- **Future**: Extensible for new file types

### Backward Compatibility
```typescript
// Old format support
const LEGACY_MIME_TYPES = {
  'application/x-pdf': 'application/pdf',
  'image/jpg': 'image/jpeg'
};

const normalizeMimeType = (mimeType: string) =>
  LEGACY_MIME_TYPES[mimeType] || mimeType;
```

## Usage in Related Components

### ImageGalleryClient
```typescript
// Uses filtered image files
const displayImages = imageFiles.filter(isImageFile);
// Renders only images in gallery
```

### ImageLightbox
```typescript
// Receives pre-filtered images
// Assumes all files are images
// Uses isImageFile for additional validation if needed
```

### PdfViewerClient
```typescript
// Uses single PDF file
// Assumes file has been validated with isPdfFile
```

## Monitoring & Analytics

### Usage Metrics
- **File Type Distribution**: Track uploaded file types
- **Detection Accuracy**: Monitor false positives/negatives
- **Performance Impact**: Measure function execution time

### Error Tracking
```typescript
// Log detection failures
if (!isPdfFile(file) && !isImageFile(file)) {
  console.warn('Unknown file type:', file.file_mime_type, file.file_name);
  // Send to analytics
}
```

## Best Practices

### Function Design
- **Pure Functions**: No side effects, predictable results
- **Type Safety**: Full TypeScript support with proper types
- **Performance**: Optimized for speed and memory usage
- **Maintainability**: Clear, readable code with good naming

### Usage Guidelines
- **Early Validation**: Use functions immediately after data fetching
- **Caching Results**: Consider memoizing for repeated checks
- **Error Boundaries**: Wrap usage in try-catch for safety
- **Logging**: Track unusual file types for analysis

### Code Organization
```typescript
// Recommended: Centralized in utilities
// app/estimate-details/utils/file-helpers.ts
export { isPdfFile, isImageFile };

// Usage throughout app
import { isPdfFile, isImageFile } from './utils/file-helpers';
```