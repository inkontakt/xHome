# Main Page Component - page.tsx

## Overview

The main page component (`app/estimate-details/page.tsx`) is a Next.js 16 server component that serves as the entry point for the estimate details feature. It handles data fetching, file processing, and orchestrates the layout of child components.

## Location
`app/estimate-details/page.tsx` (158 lines)

## Props & Parameters

### URL Search Parameters
```typescript
type PageProps = {
  searchParams?: Promise<{
    tenant_id?: string;
    estimate_id?: string;
  }>;
};
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | string | Conditional | Supabase tenant identifier |
| `estimate_id` | string | Conditional | Form submission identifier |

### Dynamic Content Logic
```typescript
const showDynamic = Boolean(tenantId && submissionId);
```
- When both parameters are present: Fetches real data from Supabase
- When missing: Shows demo/static content with fallback messages

## Data Types

### Submission
```typescript
type Submission = {
  submission_id: string;     // Primary key
  tenant_id: string;         // Multi-tenant isolation
  title: string | null;      // Estimate title
  summary: string | null;    // Estimate description
  connected_person_id: string | null; // Foreign key to person
};
```

### Person
```typescript
type Person = {
  first_name: string | null;
  last_name: string | null;
  email_primary: string | null;
};
```

### SubmissionFile
```typescript
type SubmissionFile = {
  file_name: string | null;
  file_url: string | null;
  file_mime_type: string | null;
  file_position: number | null; // Display order
};
```

## Utility Functions

### File Type Detection

#### `isPdfFile(file: SubmissionFile): boolean`
```typescript
const isPdfFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().includes("pdf") ||
  (file.file_name || "").toLowerCase().endsWith(".pdf");
```
**Purpose**: Identifies PDF files for separate processing
**Used in**: File filtering (line 79)
**Fallback**: Checks both MIME type and file extension

#### `isImageFile(file: SubmissionFile): boolean`
```typescript
const isImageFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().startsWith("image/");
```
**Purpose**: Identifies image files for gallery display
**Used in**: File filtering (line 80)
**Note**: Only checks MIME type, not file extensions

## Data Fetching Flow

### 1. Parameter Extraction (lines 41-44)
```typescript
const params = searchParams ? await searchParams : undefined;
const tenantId = params?.tenant_id;
const submissionId = params?.estimate_id;
```

### 2. Database Connection (lines 46-47)
```typescript
const showDynamic = Boolean(tenantId && submissionId);
const supabase = showDynamic ? await getSupabaseServiceClient() : null;
```

### 3. Parallel Data Fetching (lines 49-77)

#### Submission Data Query
```typescript
const { data: submission } = await supabase
  .from("form_submissions")
  .select("submission_id, tenant_id, title, summary, connected_person_id")
  .eq("tenant_id", tenantId!)
  .eq("submission_id", submissionId!)
  .maybeSingle<Submission>();
```
**Purpose**: Fetch main estimate information
**Error Handling**: Uses `maybeSingle()` for graceful failure

#### File Data Query
```typescript
const { data: files } = await supabase
  .from("form_submission_files")
  .select("file_name, file_url, file_mime_type, file_position")
  .eq("submission_id", submissionId!)
  .order("file_position", { ascending: true })
  .returns<SubmissionFile[]>();
```
**Purpose**: Fetch all file attachments
**Ordering**: Sorted by `file_position` for consistent display

#### Person Data Query
```typescript
const { data: person } = await supabase
  .from("sa_persons")
  .select("first_name, last_name, email_primary")
  .eq("person_id", personId)
  .maybeSingle<Person>();
```
**Purpose**: Fetch customer information for personalization
**Conditional**: Only executed if `connected_person_id` exists

## File Processing (lines 79-80)

```typescript
const pdfFile = files?.find(isPdfFile) ?? null;
const imageFiles = (files ?? []).filter(isImageFile);
```

**Logic**:
- Finds the first PDF file (if any) for preview
- Filters all image files for gallery display
- Uses nullish coalescing for safe array access

## Component Rendering

### Layout Structure (lines 82-157)
```tsx
<Section className="py-6 md:py-8">
  <Container className="max-w-none px-5 py-6 sm:px-5 sm:py-8">
    <div className="space-y-6">
      <header>...</header>
      <div className="grid w-full items-start gap-6 lg:grid-cols-2">
        <div className="lg:order-2 lg:sticky lg:top-24 self-start">
          <ImageGalleryClient />
        </div>
        <PDF Section />
      </div>
    </div>
  </Container>
</Section>
```

### Header Section (lines 86-103)
- **Purpose**: Personalized greeting and estimate information
- **Dynamic Content**: Shows person's name when available
- **Fallback**: Generic "Hello there" message

### Main Content Grid (lines 105-153)
- **CSS Grid**: `lg:grid-cols-2` for responsive 2-column layout
- **Order Classes**: `lg:order-1/2` for desktop PDF-left, images-right layout
- **Sticky Gallery (Desktop)**: `lg:sticky lg:top-24 self-start` keeps the image column visible while scrolling and offsets below the sticky header
- **Gap**: 1.5rem spacing between sections

## Dependencies

### Internal Dependencies
| Import | Purpose | Location |
|--------|---------|----------|
| `Section, Container` | Layout components | `@/components/craft` |
| `PdfViewerClient` | PDF rendering | `@/components/estimate-details/PdfViewerClient` |
| `ImageGalleryClient` | Image gallery | `@/components/estimate-details/ImageGalleryClient` |
| `getSupabaseServiceClient` | Database connection | `@/lib/supabase-server` |

### External Dependencies
- **Next.js**: Server components, async params
- **Supabase**: Database queries and file storage
- **TypeScript**: Type definitions and type safety

## Error Handling & Edge Cases

### Missing Parameters
- **Behavior**: Falls back to static demo content
- **UI Impact**: Shows placeholder messages instead of dynamic data
- **Database**: No queries executed when `showDynamic` is false

### Database Failures
- **Queries**: Use `maybeSingle()` to prevent crashes
- **Arrays**: Nullish coalescing (`??`) for safe access
- **UI**: Graceful degradation with fallback content

### File Processing
- **Empty Arrays**: Safe filtering with optional chaining
- **No PDFs**: PDF section shows placeholder
- **No Images**: Gallery shows empty state

## Performance Considerations

### Server-Side Rendering
- **Data Fetching**: All database queries happen on server
- **Initial Load**: No client-side data fetching required
- **SEO**: Full content available for search engines

### Query Optimization
- **Parallel Execution**: Multiple Supabase queries can run concurrently
- **Selective Fetching**: Only fetches person data when needed
- **Field Selection**: Explicit `select()` statements for minimal data transfer

## API Integration

### PDF Download Endpoint
```typescript
href={`/api/pdf?url=${encodeURIComponent(pdfFile.file_url)}&download=1&filename=PDF%20Preview`}
```
**Purpose**: Server-side PDF proxy for download functionality
**Parameters**: URL encoding, download flag, custom filename

## Responsive Design

### Breakpoints
- **Mobile (< 1024px)**: Single column, images first
- **Desktop (≥ 1024px)**: Two columns, PDF left, images right (image column is sticky)

### CSS Grid Configuration
```css
.grid.w-full.items-start.gap-6.lg:grid-cols-2
```

## Testing Considerations

### URL Parameter Testing
- Valid tenant_id + estimate_id → Dynamic content
- Missing parameters → Static content
- Invalid IDs → Graceful error handling

### Database State Testing
- Populated submissions → Full UI rendering
- Empty submissions → Placeholder content
- Missing files → Appropriate empty states

## Related Components

- **[ImageGalleryClient](../components/ImageGalleryClient.tsx.md)** - Receives `imageFiles` and `showDynamic` props
- **[PdfViewerClient](../components/PdfViewerClient.tsx.md)** - Receives `url` prop for PDF rendering
- **[Section/Container](../../shared-dependencies/craft-components.md)** - Layout primitives from craft library

## Future Enhancements

### Potential Improvements
- **Loading States**: Add skeleton loading for better UX
- **Error Boundaries**: Client-side error handling for component failures
- **Caching**: Implement ISR or revalidation strategies
- **Analytics**: Track user interactions and file access

### Scalability Considerations
- **Pagination**: For large file collections
- **Lazy Loading**: For image galleries with many files
- **CDN Integration**: For faster file delivery
