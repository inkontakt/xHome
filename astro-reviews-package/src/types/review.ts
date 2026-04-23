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

export interface ReviewCardProps {
  review: Review;
  /** Max characters before ellipsis (default 200). */
  excerptMaxChars?: number;
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
}
