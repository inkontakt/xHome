export type {
  Review,
  ReviewStats,
  ReviewCardProps,
  ReviewsGalleryProps,
  ReviewTemplateConfig,
  TemplateReviewsOptions,
  TemplateReviewsGalleryProps,
} from './types/review.js';
export {
  getReviews,
  getReviewStats,
  getReviewTemplateConfig,
  getReviewsForTemplate,
  getReviewStatsForTemplate,
  getDb,
  closeDb,
} from './lib/database.js';
export {
  formatDate,
  truncateText,
  mapPlatformName,
  getPlaceholderAvatarDataUrl,
  selectReviewContentLanguage,
  decodeHtmlEntities,
  decodeLooseUnicodeEscapes,
  getReviewPreviewText,
} from './lib/helpers.js';
export type { ReviewContentLanguage } from './lib/helpers.js';
