export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  ...(message ? { message } : {}),
  data,
});

export const createErrorResponse = (message: string, code?: string, details?: unknown) => ({
  success: false,
  message,
  ...(code ? { code } : {}),
  ...(details ? { details } : {}),
});
