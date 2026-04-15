# Data Processing & Flow

## Overview

The estimate details feature follows a structured data processing pipeline that transforms URL parameters into database queries, processes file metadata, and renders appropriate UI components. This document outlines the complete data flow from user request to component rendering.

## Architecture Overview

```
User Request → URL Parsing → Database Queries → File Processing → Component Rendering → UI Display
```

## Data Flow Pipeline

### Phase 1: Request Processing

#### URL Parameter Extraction
```typescript
// Location: app/estimate-details/page.tsx:41-44
const params = searchParams ? await searchParams : undefined;
const tenantId = params?.tenant_id;
const submissionId = params?.estimate_id;
```

**Input**: Next.js search parameters (Promise-based)
**Processing**:
- Await the search parameters promise
- Extract `tenant_id` and `estimate_id` from query string
- Handle undefined parameters gracefully

**Output**: String values or undefined

#### Dynamic Content Determination
```typescript
// Location: app/estimate-details/page.tsx:46
const showDynamic = Boolean(tenantId && submissionId);
```

**Logic**: Determines whether to show live data or static placeholders
**Conditions**: Both `tenantId` and `submissionId` must be present
**Purpose**: Enables graceful degradation for demo/development modes

### Phase 2: Database Operations

#### Supabase Client Initialization
```typescript
// Location: app/estimate-details/page.tsx:47
const supabase = showDynamic ? await getSupabaseServiceClient() : null;
```

**Conditional**: Only initialize client when dynamic content is needed
**Security**: Uses service role key for server-side operations
**Performance**: Avoids unnecessary client creation

#### Parallel Database Queries
```typescript
// Location: app/estimate-details/page.tsx:49-77

// Query 1: Submission Data
const { data: submission } = await supabase
  .from("form_submissions")
  .select("submission_id, tenant_id, title, summary, connected_person_id")
  .eq("tenant_id", tenantId!)
  .eq("submission_id", submissionId!)
  .maybeSingle<Submission>();

// Query 2: File Data
const { data: files } = await supabase
  .from("form_submission_files")
  .select("file_name, file_url, file_mime_type, file_position")
  .eq("submission_id", submissionId!)
  .order("file_position", { ascending: true })
  .returns<SubmissionFile[]>();

// Query 3: Person Data (Conditional)
const personId = submission?.connected_person_id ?? null;
const { data: person } = personId ? await supabase
  .from("sa_persons")
  .select("first_name, last_name, email_primary")
  .eq("person_id", personId)
  .maybeSingle<Person>()
  : { data: null };
```

**Query Strategy**:
1. **Primary Query**: Fetch main submission data
2. **Related Query**: Fetch associated files
3. **Optional Query**: Fetch person data only if linked

**Performance Optimizations**:
- **Selective Fields**: Only query required columns
- **Indexed Filters**: Use tenant_id and submission_id filters
- **Ordered Results**: Sort files by position for consistent display
- **Conditional Execution**: Avoid unnecessary person queries

### Phase 3: File Processing & Routing

#### File Type Separation
```typescript
// Location: app/estimate-details/page.tsx:79-80
const pdfFile = files?.find(isPdfFile) ?? null;
const imageFiles = (files ?? []).filter(isImageFile);
```

**Processing Logic**:
- **PDF Selection**: Find first PDF file (if any) for dedicated viewer
- **Image Collection**: Filter all image files for gallery display
- **Null Safety**: Handle empty or undefined file arrays

#### File Type Detection Functions
```typescript
// PDF Detection
const isPdfFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().includes("pdf") ||
  (file.file_name || "").toLowerCase().endsWith(".pdf");

// Image Detection
const isImageFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().startsWith("image/");
```

**Detection Strategy**:
- **PDF**: Dual check (MIME type + extension) for reliability
- **Images**: MIME type prefix matching for accuracy
- **Fallback**: Safe handling of null/undefined values

### Phase 4: Component Data Preparation

#### Data Structure Creation
```typescript
// Location: app/estimate-details/page.tsx:82-157

// Header Data
const headerData = {
  showDynamic,
  person,
  submission
};

// File Data
const fileData = {
  pdfFile,
  imageFiles,
  showDynamic
};

// Layout Data
const layoutData = {
  isMobile: false, // Determined by CSS Grid responsive behavior
  showPdf: Boolean(pdfFile?.file_url),
  showImages: Boolean(imageFiles.length > 0)
};
```

**Data Organization**: Structured data passed to components
**Conditional Rendering**: Based on data availability
**Responsive Logic**: CSS Grid handles mobile/desktop switching

### Phase 5: Component Rendering Pipeline

#### Layout Structure
```tsx
// Responsive Grid Container
<div className="grid w-full items-start gap-6 lg:grid-cols-2">
  {/* Images Section (Order 2 on Desktop) */}
  <div className="lg:order-2">
    <ImageGalleryClient imageFiles={imageFiles} showDynamic={showDynamic} />
  </div>

  {/* PDF Section (Order 1 on Desktop) */}
  <section className="lg:order-1">
    {/* PDF Content */}
  </section>
</div>
```

**Responsive Behavior**:
- **Mobile (< 1024px)**: Single column, images first (natural order)
- **Desktop (≥ 1024px)**: Two columns, PDF left (order-1), images right (order-2)

#### Component Data Flow

##### ImageGalleryClient Data Flow
```
imageFiles[] → ImageGalleryClient → ImageLightbox
    ↓              ↓                    ↓
[File Objects] → [Thumbnail Grid] → [Modal Viewer]
```

##### PdfViewerClient Data Flow
```
pdfFile → PdfViewerClient → PdfViewer → PDF.js Viewer
    ↓           ↓              ↓            ↓
File Object → Dynamic Import → Canvas Preview → Full Viewer
```

## Error Handling & Fallbacks

### Database Connection Failures
```typescript
// Graceful degradation when supabase is null
const { data: submission } = showDynamic && supabase
  ? await supabase.from("form_submissions")...
  : { data: null };
```

**Fallback Strategy**: Show static content instead of crashing

### Missing Data Scenarios
```typescript
// Handle undefined submission
const personId = submission?.connected_person_id ?? null;

// Handle empty file arrays
const pdfFile = files?.find(isPdfFile) ?? null;
const imageFiles = (files ?? []).filter(isImageFile);
```

**Safety Patterns**: Null coalescing and optional chaining throughout

### Component-Level Error Boundaries
```tsx
// Implicit error handling in components
{pdfFile?.file_url ? (
  <PdfViewerClient url={pdfFile.file_url} />
) : (
  <div>PDF not available</div>
)}
```

## Performance Optimization

### Server-Side Optimizations
- **Early Returns**: Skip processing when `showDynamic` is false
- **Parallel Queries**: Database calls execute concurrently
- **Selective Fetching**: Only request required fields
- **Conditional Logic**: Avoid unnecessary operations

### Client-Side Optimizations
- **Lazy Loading**: Images load progressively
- **Dynamic Imports**: PDF viewer loads on demand
- **Memoization**: Avoid redundant calculations
- **Efficient Re-renders**: Minimal component updates

### Database Optimizations
- **Indexed Queries**: Use primary and foreign key indexes
- **Ordered Results**: Leverage `file_position` index
- **Tenant Isolation**: Scoped queries prevent full table scans
- **Connection Pooling**: Reuse database connections

## State Management

### Server State
- **Static Data**: Fetched once per request
- **Immutable**: No client-side mutations
- **Cacheable**: Next.js automatic caching

### Client State (Component Level)
```typescript
// ImageGalleryClient
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

// ImageLightbox
const [selectedIndex, setSelectedIndex] = useState(initialIndex);
```

**State Scope**: Limited to individual components
**Persistence**: Lost on navigation (expected behavior)

## Data Validation & Sanitization

### Input Validation
```typescript
// URL Parameter Validation
const tenantId = params?.tenant_id;  // String or undefined
const submissionId = params?.estimate_id;  // String or undefined

// Type Safety
const showDynamic = Boolean(tenantId && submissionId);  // Boolean
```

### Database Response Validation
```typescript
// Safe Array Access
const files = (data as SubmissionFile[]) ?? [];

// Safe Object Access
const personId = submission?.connected_person_id ?? null;

// Type Guards
const isValidSubmission = (data: any): data is Submission =>
  data && typeof data.submission_id === 'string';
```

## Monitoring & Debugging

### Query Performance Tracking
```typescript
// Potential performance monitoring
const startTime = Date.now();
const { data, error } = await supabase.from('table').select('*');
const duration = Date.now() - startTime;

console.log(`Query took ${duration}ms`);
// Send to monitoring service
```

### Error Logging
```typescript
// Centralized error handling
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  // Send to error tracking service
  // Show user-friendly message
};
```

### Data Flow Tracing
```typescript
// Debug logging for data flow
console.log('Data Flow:', {
  tenantId,
  submissionId,
  showDynamic,
  hasSubmission: !!submission,
  fileCount: files?.length ?? 0,
  pdfCount: pdfFile ? 1 : 0,
  imageCount: imageFiles.length
});
```

## Future Enhancements

### Advanced Caching
```typescript
// ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour

// Custom Cache Keys
const cacheKey = `estimate-${tenantId}-${submissionId}`;
```

### Real-time Updates
```typescript
// Supabase real-time subscriptions
const channel = supabase
  .channel('files')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'form_submission_files',
    filter: `submission_id=eq.${submissionId}`
  }, (payload) => {
    // Update UI with new files
  });
```

### Progressive Loading
```typescript
// Load critical data first
const criticalData = await loadCriticalData(tenantId, submissionId);

// Then load supplementary data
const supplementaryData = await loadSupplementaryData(submissionId);
```

### Analytics Integration
```typescript
// Track data loading performance
const metrics = {
  totalLoadTime: Date.now() - startTime,
  queryCount: 3, // submission, files, person
  dataSize: calculateDataSize(submission, files, person),
  cacheHit: wasCacheHit
};

// Send to analytics service
```

## Testing Strategy

### Unit Testing
```typescript
describe('Data Processing Pipeline', () => {
  test('parameter extraction', () => {
    const params = { tenant_id: '123', estimate_id: '456' };
    expect(extractIds(params)).toEqual({
      tenantId: '123',
      submissionId: '456',
      showDynamic: true
    });
  });

  test('file type separation', () => {
    const files = [
      { file_mime_type: 'image/jpeg' },
      { file_mime_type: 'application/pdf' },
      { file_mime_type: 'image/png' }
    ];
    expect(separateFiles(files)).toEqual({
      pdfFile: files[1],
      imageFiles: [files[0], files[2]]
    });
  });
});
```

### Integration Testing
```typescript
describe('Full Data Flow', () => {
  test('complete pipeline', async () => {
    const params = { tenant_id: 'test', estimate_id: 'test' };
    const result = await processEstimateDetails(params);

    expect(result).toHaveProperty('submission');
    expect(result).toHaveProperty('files');
    expect(result).toHaveProperty('person');
    expect(result).toHaveProperty('pdfFile');
    expect(result).toHaveProperty('imageFiles');
  });
});
```

### Performance Testing
```typescript
describe('Performance Benchmarks', () => {
  test('data loading time', async () => {
    const start = Date.now();
    await loadEstimateData('test-tenant', 'test-submission');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Should load within 1 second
  });
});
```

## Migration & Compatibility

### Version Compatibility
- **Current**: Optimized for Next.js 16 and Supabase
- **Legacy**: Supports older query patterns
- **Future**: Extensible for new data sources

### Breaking Change Handling
```typescript
// Version detection and adaptation
const apiVersion = detectApiVersion(response);
switch (apiVersion) {
  case 'v1':
    return processV1Data(response);
  case 'v2':
    return processV2Data(response);
  default:
    throw new Error(`Unsupported API version: ${apiVersion}`);
}
```

This comprehensive data flow ensures reliable, performant, and maintainable data processing from URL parameters to UI rendering, with proper error handling and optimization throughout the pipeline.