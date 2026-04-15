# Estimate Details Feature Documentation

## Overview

The Estimate Details feature provides a comprehensive interface for viewing and managing estimate submissions, including image galleries and PDF previews. This feature integrates with Supabase for data storage and provides responsive design across mobile, tablet, and desktop devices.

## Architecture

### Technology Stack
- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Custom craft components, Radix UI primitives
- **File Handling**: Client-side image galleries with lightbox functionality

### Key Components
- **Main Page**: `app/estimate-details/page.tsx` - Server component handling data fetching
- **Image Gallery**: `ImageGalleryClient.tsx` - Client component for image display
- **Lightbox**: `ImageLightbox.tsx` - Modal component for full-screen image viewing
- **PDF Viewer**: `PdfViewerClient.tsx` - Client component for PDF rendering

## Data Flow

1. **URL Parameters**: Extract `tenant_id` and `estimate_id` from query parameters
2. **Database Queries**: Fetch submission data, files, and person information from Supabase
3. **File Processing**: Separate images and PDFs using MIME type detection
4. **Component Rendering**: Server-side rendering with client-side interactivity

## Responsive Design

- **Mobile (< 1024px)**: Single column, images first, PDF second
- **Desktop (≥ 1024px)**: Two columns, PDF left, images right, image column is sticky with header offset
- **Tablet**: Follows mobile behavior (single column)

## Key Features

- **Image Gallery**: Thumbnail grid with click-to-zoom lightbox
- **Lightbox Overlay**: Full-viewport modal that hides background content and locks page scroll
- **PDF Preview**: Embedded PDF viewer with download functionality
- **Responsive Layout**: Mobile-first design with desktop optimization
- **Sticky Gallery (Desktop)**: Images remain visible while scrolling the PDF section
- **Keyboard Navigation**: Full keyboard support in lightbox
- **File Type Detection**: Automatic separation of images and PDFs

## Database Dependencies

### Tables Used
- `form_submissions` - Main estimate data
- `form_submission_files` - File attachments
- `sa_persons` - Customer/person information

### Key Relationships
- Submission → Person (via `connected_person_id`)
- Submission → Files (via `submission_id`)

## Navigation

- [📋 Index](index.md) - Central navigation hub
- [📄 Main Page](page.tsx.md) - Server component documentation
- [🖼️ Components](components/) - Individual component docs
- [🔌 API Integration](api/) - Database and API documentation
- [🛠️ Utilities](utilities/) - Helper functions
- [📊 Data Flow](data-flow/) - State and data management
- [📱 Responsive Design](responsive-design.md) - Layout system

## Development Notes

- Uses Next.js App Router with async server components
- Implements graceful degradation for missing data
- Follows mobile-first responsive design principles
- Integrates with Supabase for real-time data
