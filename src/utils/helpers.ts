/**
 * Shared utility functions used across the application
 */

/**
 * Formats a date string to a readable format
 *
 * @param dateString - ISO 8601 date string or similar
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Validates if a value is of the expected type
 *
 * @param value - Value to validate
 * @param expectedType - Expected type
 * @returns True if value matches expected type
 */
export const isValidType = (value: unknown, expectedType: string): boolean => {
  return typeof value === expectedType;
};

/**
 * Validates if an object has required properties
 *
 * @param obj - Object to validate
 * @param requiredProps - Array of required property names
 * @returns True if all required properties exist
 */
export const hasRequiredProps = (obj: unknown, requiredProps: string[]): boolean => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  return requiredProps.every(prop => prop in obj);
};
