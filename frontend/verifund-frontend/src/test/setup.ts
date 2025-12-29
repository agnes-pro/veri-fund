import '@testing-library/jest-dom';

// Mock @stacks/connect
vi.mock('@stacks/connect', () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  isConnected: vi.fn(() => false),
  getLocalStorage: vi.fn(() => null),
  request: vi.fn(),
}));

// Mock @stacks/transactions
vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: vi.fn(),
  Cl: {
    uint: vi.fn((value) => ({ type: 'uint', value })),
    stringAscii: vi.fn((value) => ({ type: 'string-ascii', value })),
    list: vi.fn((items) => ({ type: 'list', value: items })),
    tuple: vi.fn((data) => ({ type: 'tuple', value: data })),
    some: vi.fn((value) => ({ type: 'some', value })),
    none: vi.fn(() => ({ type: 'none' })),
  },
  cvToValue: vi.fn((cv) => cv.value || cv),
}));

// Mock @stacks/network
vi.mock('@stacks/network', () => ({
  STACKS_TESTNET: { coreApiUrl: 'https://api.testnet.hiro.so' },
  STACKS_MAINNET: { coreApiUrl: 'https://api.hiro.so' },
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});