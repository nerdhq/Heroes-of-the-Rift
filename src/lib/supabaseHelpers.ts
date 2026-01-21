/**
 * Supabase Error Handling Utilities
 * Provides standardized error handling for all Supabase operations
 */

import type { PostgrestError, AuthError } from "@supabase/supabase-js";

// ============================================
// ERROR TYPES
// ============================================

/**
 * Normalized error structure for Supabase operations
 */
export interface SupabaseError {
  /** Human-readable error message */
  message: string;
  /** Error code (from Supabase or custom) */
  code: string;
  /** Whether this is a network-related error */
  isNetworkError: boolean;
  /** Whether this is an authentication error */
  isAuthError: boolean;
  /** Whether the error is retryable */
  isRetryable: boolean;
  /** Original error for debugging */
  originalError?: unknown;
}

/**
 * Result wrapper for Supabase operations
 */
export interface SupabaseResult<T> {
  success: boolean;
  data: T | null;
  error: SupabaseError | null;
}

// ============================================
// ERROR CODE CONSTANTS
// ============================================

export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

// Network error patterns
const NETWORK_ERROR_PATTERNS = [
  "network",
  "fetch",
  "failed to fetch",
  "connection",
  "timeout",
  "econnrefused",
  "enotfound",
  "offline",
];

// Retryable error codes
const RETRYABLE_CODES = [
  ERROR_CODES.NETWORK_ERROR,
  ERROR_CODES.TIMEOUT,
  ERROR_CODES.SERVER_ERROR,
];

// ============================================
// ERROR NORMALIZATION
// ============================================

/**
 * Check if an error message indicates a network issue
 */
function isNetworkErrorMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Normalize a Postgrest error (database operations)
 */
function normalizePostgrestError(error: PostgrestError): SupabaseError {
  const isNetwork = isNetworkErrorMessage(error.message);

  let code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES] = ERROR_CODES.UNKNOWN;
  if (isNetwork) {
    code = ERROR_CODES.NETWORK_ERROR;
  } else if (error.code === "PGRST116") {
    code = ERROR_CODES.NOT_FOUND;
  } else if (error.code === "23505") {
    code = ERROR_CODES.CONFLICT;
  } else if (error.code?.startsWith("22") || error.code?.startsWith("23")) {
    code = ERROR_CODES.VALIDATION_ERROR;
  } else if (error.code?.startsWith("5")) {
    code = ERROR_CODES.SERVER_ERROR;
  }

  // Check if code is in retryable list
  const isRetryable = (RETRYABLE_CODES as readonly string[]).includes(code);

  return {
    message: error.message,
    code,
    isNetworkError: isNetwork,
    isAuthError: false,
    isRetryable,
    originalError: error,
  };
}

/**
 * Normalize an Auth error
 */
function normalizeAuthError(error: AuthError): SupabaseError {
  const isNetwork = isNetworkErrorMessage(error.message);

  return {
    message: error.message,
    code: isNetwork ? ERROR_CODES.NETWORK_ERROR : ERROR_CODES.UNAUTHORIZED,
    isNetworkError: isNetwork,
    isAuthError: true,
    isRetryable: isNetwork,
    originalError: error,
  };
}

/**
 * Normalize any error into a standardized SupabaseError
 */
export function normalizeError(error: unknown): SupabaseError {
  // Handle null/undefined
  if (!error) {
    return {
      message: "Unknown error occurred",
      code: ERROR_CODES.UNKNOWN,
      isNetworkError: false,
      isAuthError: false,
      isRetryable: false,
    };
  }

  // Handle Postgrest errors (have 'code' and 'message' and optional 'details')
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  ) {
    const pgError = error as PostgrestError;
    return normalizePostgrestError(pgError);
  }

  // Handle Auth errors (have 'name' === 'AuthError')
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "AuthError"
  ) {
    return normalizeAuthError(error as AuthError);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const isNetwork = isNetworkErrorMessage(error.message);
    return {
      message: error.message,
      code: isNetwork ? ERROR_CODES.NETWORK_ERROR : ERROR_CODES.UNKNOWN,
      isNetworkError: isNetwork,
      isAuthError: false,
      isRetryable: isNetwork,
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    const isNetwork = isNetworkErrorMessage(error);
    return {
      message: error,
      code: isNetwork ? ERROR_CODES.NETWORK_ERROR : ERROR_CODES.UNKNOWN,
      isNetworkError: isNetwork,
      isAuthError: false,
      isRetryable: isNetwork,
    };
  }

  // Fallback for unknown types
  return {
    message: String(error),
    code: ERROR_CODES.UNKNOWN,
    isNetworkError: false,
    isAuthError: false,
    isRetryable: false,
    originalError: error,
  };
}

// ============================================
// OPERATION WRAPPERS
// ============================================

/**
 * Options for wrapped operations
 */
export interface OperationOptions {
  /** Maximum retry attempts for retryable errors */
  maxRetries?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
  /** Custom error handler */
  onError?: (error: SupabaseError) => void;
}

const DEFAULT_OPTIONS: Required<OperationOptions> = {
  maxRetries: 0,
  retryDelay: 1000,
  onError: () => {},
};

/**
 * Delay helper for retries
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wrap a Supabase operation with standardized error handling
 * @param operation The async operation to execute
 * @param options Configuration options
 * @returns A SupabaseResult with normalized error handling
 *
 * @example
 * const result = await withErrorHandling(
 *   () => supabase.from("profiles").select("*").single(),
 *   { maxRetries: 2, onError: (e) => console.log(e.message) }
 * );
 *
 * if (result.success) {
 *   // result.data is typed
 * } else {
 *   // result.error is a SupabaseError
 * }
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: OperationOptions = {}
): Promise<SupabaseResult<T>> {
  const { maxRetries, retryDelay, onError } = { ...DEFAULT_OPTIONS, ...options };

  let lastError: SupabaseError | null = null;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      const { data, error } = await operation();

      if (error) {
        lastError = normalizePostgrestError(error);
        onError(lastError);

        // Check if retryable and we have retries left
        if (lastError.isRetryable && attempts < maxRetries) {
          attempts++;
          await delay(retryDelay * attempts);
          continue;
        }

        return { success: false, data: null, error: lastError };
      }

      return { success: true, data, error: null };
    } catch (e) {
      lastError = normalizeError(e);
      onError(lastError);

      // Check if retryable and we have retries left
      if (lastError.isRetryable && attempts < maxRetries) {
        attempts++;
        await delay(retryDelay * attempts);
        continue;
      }

      return { success: false, data: null, error: lastError };
    }
  }

  // Should not reach here, but handle it
  return {
    success: false,
    data: null,
    error: lastError || normalizeError(new Error("Max retries exceeded")),
  };
}

/**
 * Wrap an RPC call with standardized error handling
 * @param operation The RPC operation to execute
 * @param options Configuration options
 * @returns A SupabaseResult with normalized error handling
 */
export async function withRpcErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: OperationOptions = {}
): Promise<SupabaseResult<T>> {
  return withErrorHandling(operation, options);
}

/**
 * Wrap an auth operation with standardized error handling
 * @param operation The auth operation to execute
 * @param options Configuration options
 * @returns A SupabaseResult with normalized error handling
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<{ data: T; error: AuthError | null }>,
  options: OperationOptions = {}
): Promise<SupabaseResult<T>> {
  const { maxRetries, retryDelay, onError } = { ...DEFAULT_OPTIONS, ...options };

  let lastError: SupabaseError | null = null;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      const { data, error } = await operation();

      if (error) {
        lastError = normalizeAuthError(error);
        onError(lastError);

        // Auth errors generally shouldn't be retried, but network errors can be
        if (lastError.isNetworkError && attempts < maxRetries) {
          attempts++;
          await delay(retryDelay * attempts);
          continue;
        }

        return { success: false, data: null, error: lastError };
      }

      return { success: true, data, error: null };
    } catch (e) {
      lastError = normalizeError(e);
      onError(lastError);

      if (lastError.isRetryable && attempts < maxRetries) {
        attempts++;
        await delay(retryDelay * attempts);
        continue;
      }

      return { success: false, data: null, error: lastError };
    }
  }

  return {
    success: false,
    data: null,
    error: lastError || normalizeError(new Error("Max retries exceeded")),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract a user-friendly error message
 */
export function getUserFriendlyMessage(error: SupabaseError): string {
  if (error.isNetworkError) {
    return "Connection error. Please check your internet connection and try again.";
  }

  if (error.isAuthError) {
    return "Authentication failed. Please sign in again.";
  }

  switch (error.code) {
    case ERROR_CODES.NOT_FOUND:
      return "The requested resource was not found.";
    case ERROR_CODES.CONFLICT:
      return "This operation conflicts with existing data.";
    case ERROR_CODES.VALIDATION_ERROR:
      return "Invalid data provided.";
    case ERROR_CODES.SERVER_ERROR:
      return "Server error. Please try again later.";
    default:
      return error.message || "An unexpected error occurred.";
  }
}

/**
 * Log an error with consistent formatting
 */
export function logSupabaseError(
  context: string,
  error: SupabaseError,
  additionalInfo?: Record<string, unknown>
): void {
  console.error(`[Supabase Error] ${context}:`, {
    message: error.message,
    code: error.code,
    isNetworkError: error.isNetworkError,
    isAuthError: error.isAuthError,
    isRetryable: error.isRetryable,
    ...additionalInfo,
  });
}
