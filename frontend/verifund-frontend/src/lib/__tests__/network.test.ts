import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPersistedNetwork, persistNetwork } from '../network';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('network utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window as defined
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  describe('getPersistedNetwork', () => {
    it('should return testnet as default when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getPersistedNetwork();

      expect(result).toBe('testnet');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('network');
    });

    it('should return stored network value', () => {
      mockLocalStorage.getItem.mockReturnValue('mainnet');

      const result = getPersistedNetwork();

      expect(result).toBe('mainnet');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('network');
    });

    it('should return testnet when window is undefined (SSR)', () => {
      // Mock SSR environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const result = getPersistedNetwork();

      expect(result).toBe('testnet');
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    it('should handle invalid stored values gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-network');

      const result = getPersistedNetwork();

      // Should still return the stored value (type assertion in real usage)
      expect(result).toBe('invalid-network');
    });
  });

  describe('persistNetwork', () => {
    it('should store network value in localStorage', () => {
      persistNetwork('mainnet');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('network', 'mainnet');
    });

    it('should store testnet value', () => {
      persistNetwork('testnet');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('network', 'testnet');
    });

    it('should not store when window is undefined (SSR)', () => {
      // Mock SSR environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      persistNetwork('mainnet');

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => persistNetwork('mainnet')).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to set network in localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('type safety', () => {
    it('should work with valid network types', () => {
      // Reset any previous mocks
      mockLocalStorage.setItem.mockReset();

      persistNetwork('testnet');
      persistNetwork('mainnet');

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.setItem).toHaveBeenNthCalledWith(1, 'network', 'testnet');
      expect(mockLocalStorage.setItem).toHaveBeenNthCalledWith(2, 'network', 'mainnet');
    });
  });
});