# Database Schema & Relationships

## Overview

The estimate details feature integrates with Supabase to fetch data from three main tables: `form_submissions`, `form_submission_files`, and `sa_persons`. This document outlines the database schema, relationships, and query patterns used throughout the application.

## Core Tables

### `form_submissions` Table

**Purpose**: Stores main estimate/form submission data

**Schema**:
```sql
CREATE TABLE form_submissions (
  submission_id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  title TEXT,
  summary TEXT,
  connected_person_id UUID REFERENCES sa_persons(person_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields**:
- `submission_id`: Primary key (UUID)
- `tenant_id`: Multi-tenant isolation identifier
- `title`: Estimate title (nullable)
- `summary`: Estimate description (nullable)
- `connected_person_id`: Foreign key to person table

**Usage in Application**:
```typescript
// Query pattern from page.tsx:49-57
const { data: submission } = await supabase
  .from("form_submissions")
  .select("submission_id, tenant_id, title, summary, connected_person_id")
  .eq("tenant_id", tenantId!)
  .eq("submission_id", submissionId!)
  .maybeSingle<Submission>();
```

### `form_submission_files` Table

**Purpose**: Stores file attachments for form submissions (images, PDFs, documents)

**Schema**:
```sql
CREATE TABLE form_submission_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES form_submissions(submission_id) ON DELETE CASCADE,
  file_name TEXT,
  file_url TEXT NOT NULL,
  file_mime_type TEXT,
  file_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields**:
- `file_id`: Primary key (UUID, auto-generated)
- `submission_id`: Foreign key to submissions table
- `file_name`: Original filename (nullable)
- `file_url`: Supabase Storage URL (required)
- `file_mime_type`: MIME type (e.g., "image/jpeg", "application/pdf")
- `file_position`: Display order (integer, defaults to 0)

**Usage in Application**:
```typescript
// Query pattern from page.tsx:59-67
const { data: files } = await supabase
  .from("form_submission_files")
  .select("file_name, file_url, file_mime_type, file_position")
  .eq("submission_id", submissionId!)
  .order("file_position", { ascending: true })
  .returns<SubmissionFile[]>();
```

### `sa_persons` Table

**Purpose**: Stores customer/person information for personalization

**Schema**:
```sql
CREATE TABLE sa_persons (
  person_id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email_primary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields**:
- `person_id`: Primary key (UUID)
- `first_name`: Person's first name (nullable)
- `last_name`: Person's last name (nullable)
- `email_primary`: Primary email address (nullable)

**Usage in Application**:
```typescript
// Query pattern from page.tsx:70-77
const { data: person } = await supabase
  .from("sa_persons")
  .select("first_name, last_name, email_primary")
  .eq("person_id", personId)
  .maybeSingle<Person>();
```

## Table Relationships

### Entity Relationship Diagram
```
form_submissions (1) ──── (many) form_submission_files
    │
    └── (1) sa_persons
```

### Foreign Key Constraints
- `form_submissions.connected_person_id` → `sa_persons.person_id`
- `form_submission_files.submission_id` → `form_submissions.submission_id` (CASCADE DELETE)

### Data Flow Relationships
1. **URL Parameters** → **Form Submission Lookup**
2. **Form Submission** → **Person Data** (optional)
3. **Form Submission** → **File Attachments** (multiple)

## Query Patterns

### Primary Data Fetching
```typescript
// 1. Get submission details
const submission = await supabase
  .from("form_submissions")
  .select("submission_id, tenant_id, title, summary, connected_person_id")
  .eq("tenant_id", tenantId)
  .eq("submission_id", submissionId)
  .maybeSingle();

// 2. Get associated person (if exists)
const personId = submission?.connected_person_id;
if (personId) {
  const person = await supabase
    .from("sa_persons")
    .select("first_name, last_name, email_primary")
    .eq("person_id", personId)
    .maybeSingle();
}

// 3. Get file attachments
const files = await supabase
  .from("form_submission_files")
  .select("file_name, file_url, file_mime_type, file_position")
  .eq("submission_id", submissionId)
  .order("file_position", { ascending: true });
```

### File Type Filtering Logic
```typescript
// PDF detection
const isPdfFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().includes("pdf") ||
  (file.file_name || "").toLowerCase().endsWith(".pdf");

// Image detection
const isImageFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().startsWith("image/");

// Usage
const pdfFile = files.find(isPdfFile);
const imageFiles = files.filter(isImageFile);
```

## Indexes & Performance

### Recommended Indexes
```sql
-- For tenant-based queries
CREATE INDEX idx_form_submissions_tenant_id ON form_submissions(tenant_id);

-- For submission lookups
CREATE INDEX idx_form_submissions_id_tenant ON form_submissions(submission_id, tenant_id);

-- For file attachment queries
CREATE INDEX idx_submission_files_submission_id ON form_submission_files(submission_id);

-- For person lookups
CREATE INDEX idx_sa_persons_id ON sa_persons(person_id);

-- For file ordering
CREATE INDEX idx_submission_files_position ON form_submission_files(submission_id, file_position);
```

### Query Performance Considerations
- **Tenant Isolation**: All queries include `tenant_id` filtering
- **File Ordering**: Uses indexed `file_position` for consistent display
- **Optional Relationships**: Person data loaded conditionally
- **Efficient Selection**: Only required fields selected

## Data Validation & Constraints

### Required Fields
- `form_submissions.submission_id` (Primary Key)
- `form_submissions.tenant_id` (Required)
- `form_submission_files.submission_id` (Required)
- `form_submission_files.file_url` (Required)

### Optional Fields
- `form_submissions.title`
- `form_submissions.summary`
- `form_submissions.connected_person_id`
- `form_submission_files.file_name`
- `form_submission_files.file_mime_type`
- `sa_persons.first_name`
- `sa_persons.last_name`
- `sa_persons.email_primary`

### Data Types
- **UUID**: Primary keys and foreign keys
- **TEXT**: Variable-length strings (names, URLs, etc.)
- **INTEGER**: File position ordering
- **TIMESTAMP**: Audit fields (created_at, updated_at)

## Security & Access Control

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_persons ENABLE ROW LEVEL SECURITY;

-- Policies for tenant isolation
CREATE POLICY tenant_isolation ON form_submissions
  FOR ALL USING (tenant_id = current_tenant_id());
```

### Access Patterns
- **Tenant-based**: All data access filtered by `tenant_id`
- **Submission-based**: File access scoped to specific submissions
- **Person-based**: Optional personalization data

## Migration History

### Initial Schema
```sql
-- Base tables for form submissions and file attachments
-- Added tenant isolation for multi-tenant support
-- Implemented file type detection and ordering
```

### Recent Changes
- Added `file_position` for custom ordering
- Enhanced person relationship for better UX
- Improved indexing for query performance

## Error Handling

### Query Error Scenarios
- **Invalid tenant_id**: Returns empty results (graceful failure)
- **Missing submission_id**: Returns null (handled by `maybeSingle()`)
- **Foreign key violations**: Cascading deletes maintain integrity
- **Network failures**: Client-side error boundaries handle timeouts

### Data Consistency
- **Cascade Deletes**: Files automatically removed when submission deleted
- **Optional Relationships**: Person data can be missing without breaking functionality
- **Default Values**: Sensible defaults for nullable fields

## Future Schema Evolution

### Potential Enhancements
- **File Metadata**: Additional file properties (size, checksum)
- **Audit Trail**: Change tracking for submissions
- **Tags/Categories**: File organization features
- **User Permissions**: Granular access control

### Migration Strategy
- **Backward Compatibility**: New fields with default values
- **Zero Downtime**: Rolling deployments with feature flags
- **Data Migration**: Scripts for populating new fields

## Monitoring & Analytics

### Key Metrics
- **Query Performance**: Response times for database operations
- **File Type Distribution**: Usage patterns for different file types
- **Error Rates**: Failed queries and data access issues
- **Storage Usage**: File attachment sizes and growth trends

### Logging
- **Access Patterns**: Which submissions/files accessed most
- **Error Tracking**: Database connection issues and failures
- **Performance Monitoring**: Slow query identification

## Development Tools

### Local Development
```bash
# Reset local database
supabase db reset

# Generate types from schema
supabase gen types typescript --local > types/supabase.ts

# Run migrations
supabase db push
```

### Testing Data
```sql
-- Insert test submission
INSERT INTO form_submissions (submission_id, tenant_id, title, summary)
VALUES (gen_random_uuid(), 'test-tenant-id', 'Test Estimate', 'Test Description');

-- Insert test files
INSERT INTO form_submission_files (submission_id, file_name, file_url, file_mime_type, file_position)
VALUES ('submission-id', 'test.pdf', 'https://example.com/test.pdf', 'application/pdf', 1);
```

## Integration Points

### API Routes
- **`/api/pdf`**: PDF proxy and download functionality
- **Database Direct**: Server components bypass API routes for efficiency

### External Services
- **Supabase Storage**: File hosting and CDN delivery
- **Supabase Auth**: Optional authentication integration
- **Supabase Edge Functions**: Potential for serverless processing