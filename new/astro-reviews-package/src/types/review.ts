import type { ReviewContentLanguage } from '../lib/helpers.js';

/** Row shape returned from SQLite `wp_wpsr_reviews` (selected columns). */
export interface Review {
  id: number;
  reviewerName: string;
  reviewerImg: string;
  reviewerUrl: string;
  rating: number;
  reviewTime: string;
  reviewerText: string;
  platformName: string;
  reviewApproved: number;
}

export interface ReviewStats {
  avgRating: number;
  totalReviews: number;
}

export interface ReviewTemplateConfig {
  platform?: string[];
  contentLanguage?: ReviewContentLanguage;
  contentType?: string;
  content_length?: number;
  totalReviewsVal?: number;
  totalReviewsNumber?: {
    desktop?: number;
    mobile?: number;
  };
  starFilterVal?: number;
  filterByTitle?: 'all' | 'include' | 'exclude' | string;
  selectedIncList?: number[];
  selectedExcList?: number[];
  selectedBusinesses?: string[];
  selectedCategories?: string[];
  order?: 'asc' | 'desc' | 'random' | string;
  hide_empty_reviews?: boolean;
  show_header?: string | boolean;
  custom_title_text?: string;
}

export interface TemplateReviewsOptions {
  limit?: number;
  offset?: number;
  device?: 'desktop' | 'mobile';
}

export interface ReviewCardProps {
  review: Review;
  /** Max characters before ellipsis (default 200). */
  excerptMaxChars?: number;
  /** Which part of Google review text to show when translated/original text is stored together. */
  contentLanguage?: ReviewContentLanguage;
}

export interface ReviewsGalleryProps {
  reviews: Review[];
  stats?: ReviewStats | null;
  /** Items shown before “Load more” expands the rest (default 9). */
  itemsPerPage?: number;
  showHeader?: boolean;
  /** Multicolour “G” mark beside the header title (default true when header is shown). */
  showGoogleLogo?: boolean;
  showLoadMore?: boolean;
  /** Header title, e.g. business name */
  headerTitle?: string;
  excerptMaxChars?: number;
  /** Which part of Google review text to show when translated/original text is stored together. */
  contentLanguage?: ReviewContentLanguage;
}

export interface TemplateReviewsGalleryProps
  extends Omit<ReviewsGalleryProps, 'reviews' | 'stats' | 'contentLanguage'> {
  /** WP Social Ninja template post ID, e.g. 428. */
  templateId: number;
  /** Override the template review limit. Defaults to the WP template setting. */
  limit?: number;
  /** Offset into the filtered template reviews. */
  offset?: number;
  /** Use desktop or mobile WP review-count setting. Default: desktop. */
  device?: 'desktop' | 'mobile';
  /** Override the template content language setting. */
  contentLanguage?: ReviewContentLanguage;
}
