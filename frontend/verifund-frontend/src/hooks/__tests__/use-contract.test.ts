import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContract } from '../use-contract';
import { request } from '@stacks/connect';
import { fetchCallReadOnlyFunction, Cl } from '@stacks/transactions';

vi.mock('@stacks/connect');
vi.mock('@stacks/transactions');

const mockRequest = vi.mocked(request);
const mockFetchCallReadOnlyFunction = vi.mocked(fetchCallReadOnlyFunction);

describe('useContract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callContract', () => {
    it('should call contract function successfully', async () => {
      const mockResponse = { txid: 'mock-tx-id' };
      mockRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContract());

      const response = await result.current.callContract({
        functionName: 'create_campaign',
        functionArgs: [
          Cl.stringAscii('Test Campaign'),
          Cl.stringAscii('Test Description'),
          Cl.uint(1000000),
        ],
      });

      expect(mockRequest).toHaveBeenCalledWith('stx_callContract', {
        contract: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.verif1',
        functionName: 'create_campaign',
        functionArgs: [
          Cl.stringAscii('Test Campaign'),
          Cl.stringAscii('Test Description'),
          Cl.uint(1000000),
        ],
        network: 'testnet',
        postConditionMode: 'allow',
        postConditions: undefined,
      });
      expect(response).toEqual({ txId: 'mock-tx-id' });
    });

    it('should handle contract call errors', async () => {
      const mockError = new Error('Contract call failed');
      mockRequest.mockRejectedValue(mockError);

      const { result } = renderHook(() => useContract());

      await expect(
        result.current.callContract({
          functionName: 'invalid_function',
        })
      ).rejects.toThrow('Contract call failed');
    });

    it('should handle missing function arguments', async () => {
      const mockResponse = { txid: 'mock-tx-id' };
      mockRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContract());

      await result.current.callContract({
        functionName: 'some_function',
      });

      expect(mockRequest).toHaveBeenCalledWith('stx_callContract', {
        contract: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.verif1',
        functionName: 'some_function',
        functionArgs: undefined,
        network: 'testnet',
        postConditionMode: 'allow',
        postConditions: undefined,
      });
    });
  });

  describe('readContract', () => {
    it('should read contract function successfully', async () => {
      const mockResult = { type: 'ok', value: { type: 'uint', value: 5n } };
      mockFetchCallReadOnlyFunction.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useContract());

      const response = await result.current.readContract('get_campaign_count');

      expect(mockFetchCallReadOnlyFunction).toHaveBeenCalledWith({
        contractAddress: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX',
        contractName: 'verif1',
        functionName: 'get_campaign_count',
        functionArgs: [],
        network: {
          coreApiUrl: 'https://api.testnet.hiro.so',
        },
        senderAddress: 'ST2A2DJN1S6CPYDR5T00RBNNQKV6XZDKQDFJTYW1V',
      });
      expect(response).toEqual(mockResult);
    });

    it('should read contract with custom arguments and sender', async () => {
      const mockResult = {
        type: 'ok',
        value: {
          type: 'tuple',
          value: { name: 'Test Campaign', goal: 1000000n }
        }
      };
      mockFetchCallReadOnlyFunction.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useContract());
      const customSender = 'ST1CUSTOM123456';

      const response = await result.current.readContract(
        'get_campaign',
        [Cl.uint(0)],
        customSender
      );

      expect(mockFetchCallReadOnlyFunction).toHaveBeenCalledWith({
        contractAddress: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX',
        contractName: 'verif1',
        functionName: 'get_campaign',
        functionArgs: [Cl.uint(0)],
        network: {
          coreApiUrl: 'https://api.testnet.hiro.so',
        },
        senderAddress: customSender,
      });
      expect(response).toEqual(mockResult);
    });

    it('should handle read contract errors', async () => {
      const mockError = new Error('Read failed');
      mockFetchCallReadOnlyFunction.mockRejectedValue(mockError);

      const { result } = renderHook(() => useContract());

      await expect(
        result.current.readContract('invalid_function')
      ).rejects.toThrow('Read failed');
    });
  });

  describe('hook stability', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useContract());

      const firstCallContract = result.current.callContract;
      const firstReadContract = result.current.readContract;

      rerender();

      expect(result.current.callContract).toBe(firstCallContract);
      expect(result.current.readContract).toBe(firstReadContract);
    });
  });
});