export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Access denied',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND: 'User not found',
  PORTFOLIO_NOT_FOUND: 'Portfolio not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  AUTH_FAILED: 'Authentication failed',
  MISSING_DATA: 'Required data is missing',
} as const;

export const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: 'Authentication successful',
  PROFILE_RETRIEVED: 'User profile retrieved successfully',
  PORTFOLIO_RETRIEVED: 'Portfolio retrieved successfully',
  PORTFOLIO_UPDATED: 'Portfolio updated successfully',
  PORTFOLIO_CREATED: 'Portfolio created successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',
} as const;
