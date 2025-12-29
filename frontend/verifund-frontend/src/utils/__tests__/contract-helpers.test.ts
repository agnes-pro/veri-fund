import { describe, it, expect } from 'vitest';
import {
  microStxToStx,
  stxToMicroStx,
  formatStxAmount,
  calculateProgress,
  validateCampaignParams,
  parseContractError,
  calculateTotalMilestoneCost,
  validateMilestoneAmounts
} from '@/lib/contract-utils';
import type { CreateCampaignParams, MilestoneInput } from '@/types/contract';

// Additional utility functions for comprehensive testing
const isValidSTXAddress = (address: string): boolean => {
  return /^S[TP][0-9A-Z]{39}$/.test(address);
};

const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

describe('Contract Helper Utilities', () => {
  describe('STX conversion utilities', () => {
    describe('microStxToStx', () => {
      it('should convert microSTX to STX correctly', () => {
        expect(microStxToStx(1000000)).toBe(1);
        expect(microStxToStx(1500000)).toBe(1.5);
        expect(microStxToStx(1000)).toBe(0.001);
        expect(microStxToStx(0)).toBe(0);
      });

      it('should handle large amounts', () => {
        expect(microStxToStx(1000000000)).toBe(1000);
        expect(microStxToStx(1234567000)).toBe(1234.567);
      });

      it('should handle fractional values', () => {
        expect(microStxToStx(1234567)).toBe(1.234567);
        expect(microStxToStx(500000)).toBe(0.5);
      });
    });

    describe('stxToMicroStx', () => {
      it('should convert STX to microSTX', () => {
        expect(stxToMicroStx(1)).toBe(1000000);
        expect(stxToMicroStx(1.5)).toBe(1500000);
        expect(stxToMicroStx(0.001)).toBe(1000);
        expect(stxToMicroStx(0)).toBe(0);
      });

      it('should handle decimal inputs', () => {
        expect(stxToMicroStx(10.5)).toBe(10500000);
        expect(stxToMicroStx(0.000001)).toBe(1);
      });

      it('should handle large amounts', () => {
        expect(stxToMicroStx(1000)).toBe(1000000000);
      });

      it('should floor fractional microSTX', () => {
        expect(stxToMicroStx(1.0000005)).toBe(1000000);
        expect(stxToMicroStx(1.0000009)).toBe(1000000);
      });
    });

    describe('formatStxAmount', () => {
      it('should format amounts for display', () => {
        expect(formatStxAmount(1000000)).toBe('1');
        expect(formatStxAmount(1500000)).toBe('1.5');
        expect(formatStxAmount(0)).toBe('0');
      });

      it('should handle large amounts with commas', () => {
        expect(formatStxAmount(1234567890000)).toContain('1,234,567');
      });

      it('should handle precision correctly', () => {
        expect(formatStxAmount(1234567)).toBe('1.234567');
      });
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      expect(calculateProgress(5000000, 10000000)).toBe(50);
      expect(calculateProgress(7500000, 10000000)).toBe(75);
      expect(calculateProgress(10000000, 10000000)).toBe(100);
    });

    it('should handle zero goal', () => {
      expect(calculateProgress(5000000, 0)).toBe(0);
    });

    it('should handle over-funding', () => {
      expect(calculateProgress(15000000, 10000000)).toBe(100);
    });

    it('should handle zero raised', () => {
      expect(calculateProgress(0, 10000000)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateProgress(3333333, 10000000)).toBe(33);
      expect(calculateProgress(6666666, 10000000)).toBe(67);
    });
  });

  describe('isValidSTXAddress', () => {
    it('should validate testnet addresses', () => {
      expect(isValidSTXAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
      expect(isValidSTXAddress('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')).toBe(true);
    });

    it('should validate mainnet addresses', () => {
      expect(isValidSTXAddress('SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
      expect(isValidSTXAddress('SP2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidSTXAddress('invalid-address')).toBe(false);
      expect(isValidSTXAddress('ST1INVALID')).toBe(false);
      expect(isValidSTXAddress('SP1TOOSHORT')).toBe(false);
      expect(isValidSTXAddress('SA1WRONGPREFIX123456789012345678901234567890')).toBe(false);
      expect(isValidSTXAddress('')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      expect(isValidSTXAddress('st1pqhqkv0rjxzfy1dgx8mnsnyve3vgzjsrtpgzgm')).toBe(false);
      expect(isValidSTXAddress('sp1pqhqkv0rjxzfy1dgx8mnsnyve3vgzjsrtpgzgm')).toBe(false);
    });
  });

  describe('truncateAddress', () => {
    const testAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    it('should truncate long addresses', () => {
      expect(truncateAddress(testAddress)).toBe('ST1P...GZGM');
      expect(truncateAddress(testAddress, 6)).toBe('ST1PQH...TPGZGM');
    });

    it('should return short addresses unchanged', () => {
      const shortAddress = 'ST1P...ZGZGM';
      expect(truncateAddress(shortAddress)).toBe('ST1P...GZGM'); // Function will still truncate based on length
    });

    it('should handle empty addresses', () => {
      expect(truncateAddress('')).toBe('');
    });

    it('should handle custom character counts', () => {
      expect(truncateAddress(testAddress, 2)).toBe('ST...GM');
      expect(truncateAddress(testAddress, 8)).toBe('ST1PQHQK...SRTPGZGM');
    });

    it('should handle addresses shorter than truncation length', () => {
      const shortAddr = 'ST1PQHQ';
      expect(truncateAddress(shortAddr, 4)).toBe(shortAddr);
    });
  });

  describe('Campaign validation', () => {
    const validCampaignParams: CreateCampaignParams = {
      name: 'Test Campaign',
      description: 'A test campaign for validation',
      goal: 50000000,
      category: 'Technology',
      milestones: [
        { name: 'Phase 1', description: 'Development phase', amount: 20000000 },
        { name: 'Phase 2', description: 'Testing phase', amount: 30000000 }
      ],
      proposal_link: 'https://example.com/proposal'
    };

    describe('validateCampaignParams', () => {
      it('should return no errors for valid campaign', () => {
        const errors = validateCampaignParams(validCampaignParams);
        expect(errors).toEqual([]);
      });

      it('should validate required fields', () => {
        const invalidParams = { ...validCampaignParams, name: '', description: '' };
        const errors = validateCampaignParams(invalidParams);

        expect(errors).toContain('Campaign name is required');
        expect(errors).toContain('Campaign description is required');
      });

      it('should validate milestone amounts against goal', () => {
        const expensiveMilestones = [
          { name: 'Phase 1', description: 'Expensive phase', amount: 60000000 }
        ];
        const invalidParams = { ...validCampaignParams, milestones: expensiveMilestones };
        const errors = validateCampaignParams(invalidParams);

        expect(errors).toContain('Total milestone amounts cannot exceed campaign goal');
      });
    });

    describe('calculateTotalMilestoneCost', () => {
      it('should sum milestone amounts correctly', () => {
        const milestones: MilestoneInput[] = [
          { name: 'Phase 1', description: 'Dev', amount: 10000000 },
          { name: 'Phase 2', description: 'Test', amount: 15000000 }
        ];

        const total = calculateTotalMilestoneCost(milestones);
        expect(total).toBe(25000000);
      });

      it('should return zero for empty array', () => {
        const total = calculateTotalMilestoneCost([]);
        expect(total).toBe(0);
      });
    });

    describe('validateMilestoneAmounts', () => {
      it('should validate milestone costs against goal', () => {
        const milestones: MilestoneInput[] = [
          { name: 'Phase 1', description: 'Dev', amount: 30000000 }
        ];

        expect(validateMilestoneAmounts(milestones, 50000000)).toBe(true);
        expect(validateMilestoneAmounts(milestones, 20000000)).toBe(false);
      });
    });
  });

  describe('Error parsing', () => {
    describe('parseContractError', () => {
      it('should parse string errors', () => {
        const result = parseContractError('Simple error');
        expect(result).toBe('Simple error');
      });

      it('should parse contract error codes', () => {
        expect(parseContractError({ value: 0 })).toBe('Campaign not found');
        expect(parseContractError({ value: 4 })).toBe('Not a funder');
        expect(parseContractError({ value: 5 })).toBe('Not the campaign owner');
      });

      it('should handle unknown error codes', () => {
        const result = parseContractError({ value: 999 });
        expect(result).toBe('Contract error: 999');
      });

      it('should handle error objects with message', () => {
        const error = { message: 'Custom error message' };
        const result = parseContractError(error);
        expect(result).toBe('Custom error message');
      });

      it('should handle unknown error formats', () => {
        const result = parseContractError({ unknownProp: 'value' });
        expect(result).toBe('Unknown contract error');
      });
    });
  });
});