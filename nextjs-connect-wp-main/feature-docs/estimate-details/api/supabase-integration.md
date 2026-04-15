# Supabase Integration

## Overview

The estimate details feature integrates deeply with Supabase for data storage, file management, and real-time capabilities. This document covers the integration patterns, authentication, and best practices used throughout the application.

## Architecture

### Service Layer Pattern
```typescript
// Server-side Supabase client
import { getSupabaseServiceClient } from "@/lib/supabase-server";

// Usage in server components
const supabase = showDynamic ? await getSupabaseServiceClient() : null;
```

### Client Initialization
```typescript
// lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'

export function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side key
    {
      auth: { persistSession: false } // Server components don't need sessions
    }
  )
}
```

## Database Operations

### Query Patterns

#### Single Record Fetching
```typescript
// Using maybeSingle() for safe optional results
const { data: submission } = await supabase
  .from("form_submissions")
  .select("submission_id, tenant_id, title, summary, connected_person_id")
  .eq("tenant_id", tenantId!)
  .eq("submission_id", submissionId!)
  .maybeSingle<Submission>();
```

**Benefits**:
- Returns `null` instead of throwing on no results
- Prevents crashes when records don't exist
- Type-safe with TypeScript generics

#### Multiple Record Fetching
```typescript
// Using array results with ordering
const { data: files } = await supabase
  .from("form_submission_files")
  .select("file_name, file_url, file_mime_type, file_position")
  .eq("submission_id", submissionId!)
  .order("file_position", { ascending: true })
  .returns<SubmissionFile[]>();
```

**Features**:
- Automatic ordering by `file_position`
- Type-safe array return
- Efficient single query for multiple files

#### Conditional Queries
```typescript
// Optional person lookup
const { data: person } = personId ? await supabase
  .from("sa_persons")
  .select("first_name, last_name, email_primary")
  .eq("person_id", personId)
  .maybeSingle<Person>()
  : { data: null };
```

**Pattern**: Conditional execution prevents unnecessary queries

## Error Handling

### Graceful Degradation
```typescript
// Server component error handling
const { data: submission } = showDynamic && supabase
  ? await supabase.from("form_submissions")...
  : { data: null };
```

**Strategy**: Fallback to static content when database unavailable

### Query-Level Error Handling
```typescript
try {
  const { data, error } = await supabase.from("table").select("*");
  if (error) {
    console.error("Supabase error:", error);
    // Handle error appropriately
  }
} catch (err) {
  // Network or other errors
}
```

## Authentication & Security

### Service Role Key
```typescript
// Server-side operations use service role
const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false }
});
```

**Security Notes**:
- Service role bypasses RLS (Row Level Security)
- Used only in server components for trusted operations
- Never exposed to client-side code

### Row Level Security (RLS)
```sql
-- Enable RLS on tables
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Tenant-based access policy
CREATE POLICY tenant_access ON form_submissions
  FOR ALL USING (tenant_id = current_setting('app.tenant_id'));
```

### Tenant Isolation
```typescript
// All queries include tenant filtering
.eq("tenant_id", tenantId!)
```

**Purpose**: Multi-tenant data separation and security

## File Storage Integration

### Supabase Storage URLs
```typescript
interface SubmissionFile {
  file_url: string; // Supabase Storage URL
  // e.g., "https://xxxxx.supabase.co/storage/v1/object/public/bucket/file.pdf"
}
```

### Storage Bucket Configuration
```sql
-- Public bucket for file access
CREATE BUCKET public_files WITH (
  public => true,
  file_size_limit => 52428800, -- 50MB
  allowed_mime_types => ARRAY['image/*', 'application/pdf']
);
```

### File Upload Flow
1. **Client Upload**: Files uploaded to Supabase Storage
2. **Database Record**: File metadata stored in `form_submission_files`
3. **URL Storage**: Public URL saved for direct access
4. **Display**: Files rendered using stored URLs

## API Routes Integration

### PDF Proxy Route (`/api/pdf`)
```typescript
// Server-side PDF handling
const proxyUrl = `/api/pdf?url=${encodeURIComponent(pdfUrl)}`;
const downloadUrl = `/api/pdf?url=${encodeURIComponent(pdfUrl)}&download=1&filename=${title}`;
```

**Purpose**: CORS handling and download functionality

### Route Implementation
```typescript
// api/pdf/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const download = searchParams.get('download');
  const filename = searchParams.get('filename');

  // Fetch PDF from Supabase Storage
  const response = await fetch(url!);

  if (download) {
    return new Response(response.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename || 'download.pdf'}"`,
        'Content-Type': 'application/pdf',
      },
    });
  }

  return new Response(response.body, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

## Performance Optimization

### Query Optimization
```typescript
// Selective field selection
.select("submission_id, tenant_id, title, summary")
// Only fetch required fields
.order("file_position", { ascending: true })
// Use database indexes
```

### Connection Pooling
- **Server Components**: Automatic connection reuse
- **Service Client**: Persistent connections for server operations
- **No Client-Side**: Prevents unnecessary connection overhead

### Caching Strategy
```typescript
// Next.js automatic caching
// Server components cached by default
// Revalidation on data changes
```

## Real-time Features

### Subscription Pattern (Future Enhancement)
```typescript
// Real-time file updates
const channel = supabase
  .channel('files')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'form_submission_files' },
    (payload) => {
      console.log('File change:', payload);
      // Update UI with new files
    }
  )
  .subscribe();
```

### Live Updates
- **File Additions**: New files appear automatically
- **Status Changes**: Processing status updates
- **Deletions**: Removed files disappear from UI

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (optional, for direct connections)
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
```

### Environment-Specific Setup
```typescript
// Development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Production
// Uses production environment variables
```

## Monitoring & Debugging

### Query Logging
```typescript
// Enable query logging in development
const supabase = createClient(url, key, {
  db: { schema: 'public' },
  global: { logger: console.log }
});
```

### Performance Monitoring
```typescript
// Query performance tracking
const start = Date.now();
const { data } = await supabase.from('table').select('*');
const duration = Date.now() - start;
console.log(`Query took ${duration}ms`);
```

### Error Tracking
```typescript
// Centralized error handling
const { data, error } = await supabase.from('table').select('*');
if (error) {
  // Log to error tracking service
  console.error('Supabase Error:', error);
  // Send to monitoring service
}
```

## Migration & Deployment

### Database Migrations
```bash
# Create migration
supabase migration new add_file_position

# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Storage buckets created
- [ ] RLS policies configured
- [ ] API routes tested
- [ ] File upload functionality verified

## Troubleshooting

### Common Issues

#### Connection Failures
```typescript
// Check environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
```

#### Query Failures
```typescript
// Debug query results
const { data, error } = await supabase.from('table').select('*');
console.log('Data:', data);
console.log('Error:', error);
```

#### CORS Issues
```typescript
// Use proxy route for external URLs
const proxyUrl = `/api/pdf?url=${encodeURIComponent(externalUrl)}`;
const response = await fetch(proxyUrl);
```

### Performance Issues
- **Large Datasets**: Implement pagination
- **Slow Queries**: Add database indexes
- **Memory Leaks**: Clean up subscriptions and listeners

## Future Enhancements

### Advanced Features
- **Real-time Collaboration**: Multiple users editing submissions
- **File Versioning**: Track file changes over time
- **Advanced Search**: Full-text search across submissions
- **Analytics**: Usage tracking and reporting

### Scalability Improvements
- **Read Replicas**: Separate read/write databases
- **Caching Layer**: Redis for frequently accessed data
- **CDN Integration**: Global file distribution
- **Queue System**: Background processing for large files

### Security Enhancements
- **API Key Rotation**: Automated key management
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Encryption**: Data encryption at rest and in transit