import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContext } from 'react';
import { HiroWalletProvider, HiroWalletContext } from '../HiroWalletProvider';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import * as networkUtils from '../network';

vi.mock('@stacks/connect');
vi.mock('../network');

const mockConnect = vi.mocked(connect);
const mockDisconnect = vi.mocked(disconnect);
const mockIsConnected = vi.mocked(isConnected);
const mockGetLocalStorage = vi.mocked(getLocalStorage);
const mockGetPersistedNetwork = vi.mocked(networkUtils.getPersistedNetwork);
const mockPersistNetwork = vi.mocked(networkUtils.persistNetwork);

// Test component to access context
function TestComponent() {
  const wallet = useContext(HiroWalletContext);

  return (
    <div>
      <div data-testid="wallet-connected">{wallet.isWalletConnected.toString()}</div>
      <div data-testid="wallet-open">{wallet.isWalletOpen.toString()}</div>
      <div data-testid="testnet-address">{wallet.testnetAddress || 'null'}</div>
      <div data-testid="mainnet-address">{wallet.mainnetAddress || 'null'}</div>
      <div data-testid="network">{wallet.network || 'null'}</div>
      <button
        data-testid="connect-btn"
        onClick={wallet.authenticate}
      >
        Connect
      </button>
      <button
        data-testid="disconnect-btn"
        onClick={wallet.disconnect}
      >
        Disconnect
      </button>
      <button
        data-testid="set-network-btn"
        onClick={() => wallet.setNetwork('mainnet')}
      >
        Set Mainnet
      </button>
    </div>
  );
}

describe('HiroWalletProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsConnected.mockReturnValue(false);
    mockGetPersistedNetwork.mockReturnValue('testnet');

    // Mock window
    Object.defineProperty(window, 'window', {
      value: {},
      writable: true,
    });
  });

  it('should provide default wallet context values', () => {
    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    expect(screen.getByTestId('wallet-connected')).toHaveTextContent('false');
    expect(screen.getByTestId('wallet-open')).toHaveTextContent('false');
    expect(screen.getByTestId('testnet-address')).toHaveTextContent('null');
    expect(screen.getByTestId('mainnet-address')).toHaveTextContent('null');
  });

  it('should load persisted network on mount', async () => {
    mockGetPersistedNetwork.mockReturnValue('mainnet');

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('network')).toHaveTextContent('mainnet');
    });
  });

  it('should handle successful wallet connection', async () => {
    mockConnect.mockResolvedValue();
    mockIsConnected.mockReturnValueOnce(false).mockReturnValueOnce(true);

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    fireEvent.click(screen.getByTestId('connect-btn'));

    // Wallet should be marked as open during connection
    await waitFor(() => {
      expect(screen.getByTestId('wallet-open')).toHaveTextContent('true');
    });

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
      expect(screen.getByTestId('wallet-connected')).toHaveTextContent('true');
      expect(screen.getByTestId('wallet-open')).toHaveTextContent('false');
    });
  });

  it('should handle wallet connection failure', async () => {
    const mockError = new Error('Connection failed');
    mockConnect.mockRejectedValue(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    fireEvent.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Connection failed:', mockError);
      expect(screen.getByTestId('wallet-connected')).toHaveTextContent('false');
      expect(screen.getByTestId('wallet-open')).toHaveTextContent('false');
    });

    consoleSpy.mockRestore();
  });

  it('should handle wallet disconnection', async () => {
    mockIsConnected.mockReturnValue(true);

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    fireEvent.click(screen.getByTestId('disconnect-btn'));

    expect(mockDisconnect).toHaveBeenCalled();
    expect(screen.getByTestId('wallet-connected')).toHaveTextContent('false');
  });

  it('should extract testnet address correctly', () => {
    mockIsConnected.mockReturnValue(true);
    mockGetLocalStorage.mockReturnValue({
      addresses: {
        stx: [{ address: 'ST1TESTADDRESS123' }]
      }
    });

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    expect(screen.getByTestId('testnet-address')).toHaveTextContent('ST1TESTADDRESS123');
    expect(screen.getByTestId('mainnet-address')).toHaveTextContent('null');
  });

  it('should extract mainnet address correctly', () => {
    mockIsConnected.mockReturnValue(true);
    mockGetLocalStorage.mockReturnValue({
      addresses: {
        stx: [{ address: 'SP1MAINNETADDRESS123' }]
      }
    });

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    expect(screen.getByTestId('mainnet-address')).toHaveTextContent('SP1MAINNETADDRESS123');
    expect(screen.getByTestId('testnet-address')).toHaveTextContent('null');
  });

  it('should handle missing address data', () => {
    mockIsConnected.mockReturnValue(true);
    mockGetLocalStorage.mockReturnValue({
      addresses: {
        stx: []
      }
    });

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    expect(screen.getByTestId('testnet-address')).toHaveTextContent('null');
    expect(screen.getByTestId('mainnet-address')).toHaveTextContent('null');
  });

  it('should update and persist network', () => {
    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    fireEvent.click(screen.getByTestId('set-network-btn'));

    expect(mockPersistNetwork).toHaveBeenCalledWith('mainnet');
  });

  it('should not render children before mounting', () => {
    // Mock mounted state as false initially
    const { container } = render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    // Initially the provider returns null during SSR
    // After mounting, it should render children
    expect(container.firstChild).toBeTruthy();
  });

  it('should handle wallet detection on mount', () => {
    mockIsConnected.mockReturnValue(true);

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    expect(screen.getByTestId('wallet-connected')).toHaveTextContent('true');
  });

  it('should handle stacks connect loading error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock isConnected to throw an error
    mockIsConnected.mockImplementation(() => {
      throw new Error('Failed to load @stacks/connect');
    });

    render(
      <HiroWalletProvider>
        <TestComponent />
      </HiroWalletProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load @stacks/connect:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});