// ── Application Constants ──────────────────────────────────────────────────

export const APP_NAME = process.env.REACT_APP_APP_NAME || 'Udaan';
export const APP_TAGLINE = process.env.REACT_APP_APP_TAGLINE || 'Empowering Dalit Community Through Mentorship';
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// ── User Roles ─────────────────────────────────────────────────────────────
export const ROLES = {
  SEEKER: 'seeker',
  EXPERT: 'expert',
  ADMIN: 'admin',
};

// ── Auth Token Keys ────────────────────────────────────────────────────────
export const TOKEN_KEY = 'udaan_access_token';
export const REFRESH_TOKEN_KEY = 'udaan_refresh_token';
export const USER_KEY = 'udaan_user';

// ── Route Paths ────────────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Onboarding
  ROLE_SELECT: '/onboarding/role',
  SEEKER_ONBOARDING: '/onboarding/seeker',
  EXPERT_ONBOARDING: '/onboarding/expert',

  // Core App
  DASHBOARD: '/dashboard',
  EXPLORE: '/explore',
  EXPERT_PROFILE: '/experts/:id',
  MY_PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  REQUEST_MENTORSHIP: '/request/:expertId',
  MY_REQUESTS: '/requests',

  // Community
  FORUM: '/forum',
  FORUM_POST: '/forum/:id',
  CREATE_POST: '/forum/create',

  // Resources
  RESOURCES: '/resources',
  RESOURCE_DETAIL: '/resources/:id',

  // Messages
  MESSAGES: '/messages',
  MESSAGE_THREAD: '/messages/:userId',

  // Settings
  SETTINGS: '/settings',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_ANALYTICS: '/admin/analytics',

  // Auth OAuth Callbacks
  OAUTH_CALLBACK: '/auth/callback',
};

// ── API Endpoints ──────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
    LINKEDIN: '/auth/linkedin',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: (id) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    CHANGE_PASSWORD: '/users/change-password',
  },

  // Experts
  EXPERTS: {
    LIST: '/experts',
    DETAIL: (id) => `/experts/${id}`,
    ONBOARDING: '/experts/onboarding',
    AVAILABILITY: '/experts/availability',
    REVIEWS: (id) => `/experts/${id}/reviews`,
  },

  // Mentorship
  MENTORSHIP: {
    REQUESTS: '/mentorship/requests',
    REQUEST_DETAIL: (id) => `/mentorship/requests/${id}`,
    ACCEPT: (id) => `/mentorship/requests/${id}/accept`,
    DECLINE: (id) => `/mentorship/requests/${id}/decline`,
    SESSIONS: '/mentorship/sessions',
  },

  // Forum
  FORUM: {
    POSTS: '/forum/posts',
    POST_DETAIL: (id) => `/forum/posts/${id}`,
    COMMENTS: (postId) => `/forum/posts/${postId}/comments`,
    VOTE: (postId) => `/forum/posts/${postId}/vote`,
  },

  // Resources
  RESOURCES: {
    LIST: '/resources',
    DETAIL: (id) => `/resources/${id}`,
    UPLOAD: '/resources/upload',
    BOOKMARK: (id) => `/resources/${id}/bookmark`,
  },

  // Messages
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    THREAD: (userId) => `/messages/${userId}`,
    SEND: '/messages/send',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (id) => `/admin/users/${id}`,
    BAN_USER: (id) => `/admin/users/${id}/ban`,
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
    FLAGGED: '/admin/flagged',
  },
};

// ── Pagination ─────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  EXPERTS_PER_PAGE: 12,
  POSTS_PER_PAGE: 15,
  RESOURCES_PER_PAGE: 12,
  MESSAGES_PER_PAGE: 30,
};

// ── Expertise Categories ───────────────────────────────────────────────────
export const EXPERTISE_CATEGORIES = [
  { value: 'software_engineering', label: 'Software Engineering' },
  { value: 'data_science', label: 'Data Science & AI' },
  { value: 'design', label: 'UX/UI Design' },
  { value: 'product_management', label: 'Product Management' },
  { value: 'marketing', label: 'Marketing & Growth' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'law', label: 'Law & Legal' },
  { value: 'medicine', label: 'Medicine & Healthcare' },
  { value: 'education', label: 'Education & Academia' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'civil_services', label: 'Civil Services (IAS/IPS)' },
  { value: 'journalism', label: 'Journalism & Media' },
  { value: 'social_work', label: 'Social Work & NGO' },
  { value: 'arts_culture', label: 'Arts & Culture' },
  { value: 'science_research', label: 'Science & Research' },
  { value: 'other', label: 'Other' },
];

// ── Mentorship Topics ──────────────────────────────────────────────────────
export const MENTORSHIP_TOPICS = [
  'Career guidance',
  'Resume review',
  'Interview preparation',
  'Skill development',
  'Networking advice',
  'Industry insights',
  'Higher education guidance',
  'Scholarship applications',
  'Startup advice',
  'Personal development',
  'Work-life balance',
  'First job guidance',
];

// ── User Status ────────────────────────────────────────────────────────────
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification',
};

// ── Request Status ─────────────────────────────────────────────────────────
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'Pending',
  [REQUEST_STATUS.ACCEPTED]: 'Accepted',
  [REQUEST_STATUS.DECLINED]: 'Declined',
  [REQUEST_STATUS.COMPLETED]: 'Completed',
  [REQUEST_STATUS.CANCELLED]: 'Cancelled',
};

export const REQUEST_STATUS_COLORS = {
  [REQUEST_STATUS.PENDING]: 'warning',
  [REQUEST_STATUS.ACCEPTED]: 'success',
  [REQUEST_STATUS.DECLINED]: 'error',
  [REQUEST_STATUS.COMPLETED]: 'secondary',
  [REQUEST_STATUS.CANCELLED]: 'neutral',
};

// ── Forum Categories ───────────────────────────────────────────────────────
export const FORUM_CATEGORIES = [
  { value: 'career', label: 'Career Advice', icon: '💼' },
  { value: 'industry', label: 'Industry Insights', icon: '🏭' },
  { value: 'success', label: 'Success Stories', icon: '🌟' },
  { value: 'qa', label: 'Q&A', icon: '❓' },
  { value: 'resources', label: 'Resources', icon: '📚' },
  { value: 'events', label: 'Events', icon: '📅' },
  { value: 'general', label: 'General', icon: '💬' },
];

// ── Resource Types ─────────────────────────────────────────────────────────
export const RESOURCE_TYPES = [
  { value: 'article', label: 'Article', icon: '📄' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'pdf', label: 'PDF', icon: '📕' },
  { value: 'tool', label: 'Tool', icon: '🔧' },
  { value: 'course', label: 'Course', icon: '🎓' },
  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'template', label: 'Template', icon: '📋' },
];

// ── Experience Levels ──────────────────────────────────────────────────────
export const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Student' },
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-7 years)' },
  { value: 'senior', label: 'Senior (8-15 years)' },
  { value: 'executive', label: 'Executive (15+ years)' },
];

// ── Languages ──────────────────────────────────────────────────────────────
export const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'odia', label: 'Odia' },
  { value: 'assamese', label: 'Assamese' },
];

// ── File Upload ────────────────────────────────────────────────────────────
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOC_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// ── Validation Rules ───────────────────────────────────────────────────────
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  POST_TITLE_MAX_LENGTH: 150,
  POST_CONTENT_MAX_LENGTH: 5000,
  COMMENT_MAX_LENGTH: 1000,
  REQUEST_DESC_MAX_LENGTH: 500,
};

// ── Sort Options ───────────────────────────────────────────────────────────
export const SORT_OPTIONS = {
  EXPERTS: [
    { value: 'recommended', label: 'Recommended' },
    { value: '-rating', label: 'Highest Rated' },
    { value: '-sessions', label: 'Most Sessions' },
    { value: '-createdAt', label: 'Newest' },
  ],
  FORUM: [
    { value: '-createdAt', label: 'Most Recent' },
    { value: '-votes', label: 'Most Upvoted' },
    { value: '-commentCount', label: 'Most Discussed' },
    { value: '-views', label: 'Most Viewed' },
  ],
  RESOURCES: [
    { value: '-createdAt', label: 'Most Recent' },
    { value: '-downloads', label: 'Most Downloaded' },
    { value: '-rating', label: 'Highest Rated' },
    { value: 'title', label: 'Alphabetical' },
  ],
};
