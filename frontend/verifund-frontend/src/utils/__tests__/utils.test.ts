import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/utils';

describe('cn utility function behavior', () => {
  describe('when combining basic class names', () => {
    it('should merge simple class names correctly', () => {
      const result = cn('px-2', 'py-1');

      expect(result).toBe('px-2 py-1');
    });

    it('should handle single class name input', () => {
      const result = cn('bg-blue-500');

      expect(result).toBe('bg-blue-500');
    });

    it('should handle empty input gracefully', () => {
      const result = cn();

      expect(result).toBe('');
    });
  });

  describe('when handling conditional classes', () => {
    it('should include class when condition is true', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');

      expect(result).toBe('base-class active-class');
    });

    it('should exclude class when condition is false', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');

      expect(result).toBe('base-class');
    });

    it('should handle multiple conditional classes', () => {
      const isLoading = true;
      const hasError = false;
      const result = cn(
        'btn',
        isLoading && 'btn-loading',
        hasError && 'btn-error'
      );

      expect(result).toBe('btn btn-loading');
    });
  });

  describe('when resolving conflicting Tailwind classes', () => {
    it('should resolve conflicting padding classes with last one winning', () => {
      const result = cn('p-2', 'p-4');

      expect(result).toBe('p-4');
    });

    it('should resolve conflicting background colors', () => {
      const result = cn('bg-red-500', 'bg-blue-500');

      expect(result).toBe('bg-blue-500');
    });

    it('should keep non-conflicting classes together', () => {
      const result = cn('px-2', 'py-4', 'bg-blue-500', 'text-white');

      expect(result).toBe('px-2 py-4 bg-blue-500 text-white');
    });

    it('should resolve complex conflicting scenarios', () => {
      const result = cn(
        'px-2 py-1 bg-red-500',
        'px-4',
        'bg-blue-500 text-white'
      );

      expect(result).toBe('py-1 px-4 bg-blue-500 text-white');
    });
  });

  describe('when handling different input types', () => {
    it('should handle array of class names', () => {
      const result = cn(['px-2', 'py-1'], 'bg-blue-500');

      expect(result).toBe('px-2 py-1 bg-blue-500');
    });

    it('should handle object with boolean values', () => {
      const result = cn({
        'bg-red-500': true,
        'text-white': true,
        'hidden': false
      });

      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle mixed input types together', () => {
      const result = cn(
        'base-class',
        ['px-2', 'py-1'],
        {
          'bg-blue-500': true,
          'hidden': false
        },
        'text-white'
      );

      expect(result).toBe('base-class px-2 py-1 bg-blue-500 text-white');
    });
  });

  describe('when handling edge cases', () => {
    it('should handle null and undefined values', () => {
      const result = cn('base-class', null, undefined, 'other-class');

      expect(result).toBe('base-class other-class');
    });

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'other-class');

      expect(result).toBe('base-class other-class');
    });

    it('should handle whitespace-only strings', () => {
      const result = cn('base-class', '   ', 'other-class');

      expect(result).toBe('base-class other-class');
    });

    it('should trim and normalize whitespace', () => {
      const result = cn('  px-2  ', 'py-1   bg-blue-500  ');

      expect(result).toBe('px-2 py-1 bg-blue-500');
    });
  });

  describe('when used in real-world component scenarios', () => {
    it('should work for button variant combinations', () => {
      const variant = 'primary';
      const size = 'lg';
      const disabled = false;

      const result = cn(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        size === 'lg' && 'btn-lg',
        disabled && 'btn-disabled'
      );

      expect(result).toBe('btn btn-primary btn-lg');
    });

    it('should work for card state combinations', () => {
      const isHovered = true;
      const isSelected = false;
      const hasError = false;

      const result = cn(
        'card p-4 border rounded',
        isHovered && 'shadow-lg transform scale-105',
        isSelected && 'border-blue-500 bg-blue-50',
        hasError && 'border-red-500 bg-red-50'
      );

      expect(result).toBe('card p-4 border rounded shadow-lg transform scale-105');
    });

    it('should resolve responsive class conflicts correctly', () => {
      const result = cn(
        'w-full',
        'md:w-1/2',
        'lg:w-1/3',
        'md:w-2/3' // This should override the previous md:w-1/2
      );

      expect(result).toBe('w-full lg:w-1/3 md:w-2/3');
    });
  });
});