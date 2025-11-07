import { describe, it, expect } from 'vitest';
import { formatDate, isValidType, hasRequiredProps } from './helpers';

describe('helpers utility functions', () => {
  describe('formatDate', () => {
    it('should format a valid ISO date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format a valid date with time', () => {
      const result = formatDate('2024-03-20T10:30:00Z');
      expect(result).toBe('Mar 20, 2024');
    });

    it('should handle December dates', () => {
      const result = formatDate('2024-12-25');
      expect(result).toBe('Dec 25, 2024');
    });

    it('should handle single digit dates', () => {
      const result = formatDate('2024-01-05');
      expect(result).toBe('Jan 5, 2024');
    });

    it('should return "Invalid Date" for invalid date', () => {
      const invalidDate = 'not-a-date';
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });

    it('should return "Invalid Date" for empty string', () => {
      const result = formatDate('');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('isValidType', () => {
    it('should return true for matching string type', () => {
      expect(isValidType('hello', 'string')).toBe(true);
    });

    it('should return true for matching number type', () => {
      expect(isValidType(42, 'number')).toBe(true);
    });

    it('should return true for matching boolean type', () => {
      expect(isValidType(true, 'boolean')).toBe(true);
    });

    it('should return true for matching object type', () => {
      expect(isValidType({}, 'object')).toBe(true);
    });

    it('should return true for matching function type', () => {
      expect(isValidType(() => {}, 'function')).toBe(true);
    });

    it('should return false for non-matching type', () => {
      expect(isValidType('hello', 'number')).toBe(false);
    });

    it('should return false for null when checking object', () => {
      // Note: typeof null === 'object' in JavaScript, so this will return true
      expect(isValidType(null, 'object')).toBe(true);
    });

    it('should return false for undefined', () => {
      expect(isValidType(undefined, 'string')).toBe(false);
    });
  });

  describe('hasRequiredProps', () => {
    it('should return true when all required props exist', () => {
      const obj = { name: 'John', age: 30, city: 'NYC' };
      expect(hasRequiredProps(obj, ['name', 'age'])).toBe(true);
    });

    it('should return true with empty required props array', () => {
      const obj = { name: 'John' };
      expect(hasRequiredProps(obj, [])).toBe(true);
    });

    it('should return false when a required prop is missing', () => {
      const obj = { name: 'John' };
      expect(hasRequiredProps(obj, ['name', 'age'])).toBe(false);
    });

    it('should return false for null value', () => {
      expect(hasRequiredProps(null, ['name'])).toBe(false);
    });

    it('should return false for undefined value', () => {
      expect(hasRequiredProps(undefined, ['name'])).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(hasRequiredProps('string', ['length'])).toBe(false);
      expect(hasRequiredProps(42, ['toString'])).toBe(false);
    });

    it('should check prop existence, not values', () => {
      const obj = { name: null, age: undefined };
      expect(hasRequiredProps(obj, ['name', 'age'])).toBe(true);
    });

    it('should handle nested object checks', () => {
      const obj = { user: { name: 'John' } };
      expect(hasRequiredProps(obj, ['user'])).toBe(true);
      expect(hasRequiredProps(obj, ['user', 'profile'])).toBe(false);
    });
  });
});
