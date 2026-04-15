# Estimate Details - Central Index

## 🚀 Quick Start
- **[Main Overview](README.md)** - Feature overview and architecture
- **[Main Page](page.tsx.md)** - Entry point and data fetching
- **[Live Demo](http://localhost:3000/estimate-details?tenant_id=demo&estimate_id=demo)** - View the feature

## 📋 Component Reference

### Core Components
| Component | Location | Purpose | Dependencies |
|-----------|----------|---------|--------------|
| **[Main Page](page.tsx.md)** | `app/estimate-details/page.tsx` | Data fetching & layout | Supabase, craft components |
| **[ImageGalleryClient](components/ImageGalleryClient.tsx.md)** | `components/estimate-details/ImageGalleryClient.tsx` | Image grid display | ImageLightbox, React state |
| **[ImageLightbox](components/ImageLightbox.tsx.md)** | `components/estimate-details/ImageLightbox.tsx` | Full-screen image viewer | Lucide icons, React hooks |
| **[PdfViewerClient](components/PdfViewerClient.tsx.md)** | `components/estimate-details/PdfViewerClient.tsx` | PDF embed & download | External PDF viewer |

## 🔌 API & Database

### Database Operations
| Operation | Table | Purpose | Location |
|-----------|-------|---------|----------|
| **[Form Submissions](api/database-schema.md#form_submissions)** | `form_submissions` | Main estimate data | [page.tsx:50-57](page.tsx.md#database-queries) |
| **[File Attachments](api/database-schema.md#form_submission_files)** | `form_submission_files` | Image/PDF files | [page.tsx:59-67](page.tsx.md#database-queries) |
| **[Person Data](api/database-schema.md#sa_persons)** | `sa_persons` | Customer info | [page.tsx:70-77](page.tsx.md#database-queries) |

### External Integrations
- **[Supabase Client](api/supabase-integration.md)** - Database connection & queries
- **[File Processing](api/file-handling.md)** - MIME type detection & file routing

## 🛠️ Utility Functions

### File Type Helpers
| Function | Purpose | Location | Usage |
|----------|---------|----------|-------|
| **`isPdfFile()`** | PDF detection | [page.tsx:34-37](utilities/file-type-helpers.md#ispdffile) | File filtering |
| **`isImageFile()`** | Image detection | [page.tsx:38-40](utilities/file-type-helpers.md#isimagefile) | File filtering |

**[View All Utilities](utilities/file-type-helpers.md)**

## 📊 Data Flow & State

### Data Processing Pipeline
1. **[Parameter Extraction](data-flow/data-processing.md#parameter-extraction)** - URL params parsing
2. **[Database Queries](data-flow/data-processing.md#database-queries)** - Parallel data fetching
3. **[File Separation](data-flow/data-processing.md#file-processing)** - Image vs PDF routing
4. **[Component Rendering](data-flow/data-processing.md#component-rendering)** - UI assembly

**[Complete Data Flow](data-flow/data-processing.md)** - See also: [File Type Helpers](utilities/file-type-helpers.md)

## 📱 Responsive Behavior

### Breakpoints & Layout
| Screen Size | Columns | Order | CSS Classes |
|-------------|---------|-------|-------------|
| **Mobile (< 1024px)** | 1 | Images → PDF | Default (no order classes) |
| **Desktop (≥ 1024px)** | 2 | PDF → Images (sticky) | `lg:grid-cols-2`, `lg:order-1/2`, `lg:sticky lg:top-24` |

**[Responsive Design Details](responsive-design.md)** - See also: [Main Page Layout](page.tsx.md#component-rendering)

## 🔗 Function Cross-References

### State Management
- **`selectedIndex`** → [ImageLightbox](components/ImageLightbox.tsx.md#state-management)
- **`lightboxOpen`** → [ImageGalleryClient](components/ImageGalleryClient.tsx.md#state-management)

### Event Handlers
- **`handleImageClick()`** → [ImageGalleryClient](components/ImageGalleryClient.tsx.md#event-handlers)
- **`handleNextPhoto()`** → [ImageLightbox](components/ImageLightbox.tsx.md#navigation-functions)
- **`handlePrevPhoto()`** → [ImageLightbox](components/ImageLightbox.tsx.md#navigation-functions)

### Data Processing
- **`isPdfFile()`** → Used in [page.tsx](page.tsx.md#file-filtering)
- **`isImageFile()`** → Used in [page.tsx](page.tsx.md#file-filtering)

## 🎨 Styling & UI

### Key Design Elements
- **Primary Color**: Theme primary color for buttons and accents
- **Background**: Custom `#e2e8f0` for image containers
- **Grid Layout**: CSS Grid with responsive breakpoints
- **Hover Effects**: Primary background with white text on interactive elements

### Component Styling
- **[Lightbox Styling](components/ImageLightbox.tsx.md#styling)**
- **[Button Interactions](components/ImageLightbox.tsx.md#button-styling)**
- **[Responsive Layout](responsive-design.md)**

## 🚨 Error Handling & Edge Cases

### Graceful Degradation
- **Missing Data**: Fallback UI when database queries fail
- **Empty States**: Placeholder content when no files exist
- **Network Issues**: Client-side error boundaries

### Validation
- **File Types**: MIME type and extension validation
- **URL Parameters**: Tenant and estimate ID validation
- **Database Constraints**: Foreign key relationships

## 🔧 Maintenance & Updates

### Common Modification Points
- **[Adding File Types](utilities/file-type-helpers.md#extending-file-types)** - Support new file formats
- **[UI Customization](components/ImageLightbox.tsx.md#customization)** - Theme and styling changes
- **[Database Schema](api/database-schema.md#schema-updates)** - Adding new fields/tables

### Performance Considerations
- **Lazy Loading**: Image loading optimization
- **Query Optimization**: Database query efficiency
- **Bundle Size**: Component splitting strategies

---

## 📚 Related Documentation

### Project-Wide Resources
- [Project Architecture](../../ARCHITECTURE.md)
- [Supabase Setup](../../SUPABASE_SETUP.md)
- [Component Library](../../SUPABASE_COMPONENTS.md)

### Feature-Specific Links
- [Image Lightbox Navigation](../../help-desk/IMAGE_LIGHTBOX_NAVIGATION.md)
- [Estimate Details Page](../../app/estimate-details/page.tsx)

### API References
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [@react-pdf-viewer/core](https://react-pdf-viewer.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)

*Last updated: January 23, 2026* | *Next.js 16 + Supabase Integration* | *Comprehensive Documentation v1.0*
